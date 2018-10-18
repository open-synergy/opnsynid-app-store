openerp.pos_register_invoice_payments = function(instance){
	var module = instance.point_of_sale;
	var SuperPosModel = module.PosModel.prototype;
	var SuperClientListScreenWidget = module.ClientListScreenWidget.prototype;
	var SuperPosWidget = module.PosWidget.prototype;
	var QWeb = instance.web.qweb;
	module.InvoiceListScreenWidget.include({
		display_invoice_details: function(visibility, invoice, clickpos) {
			var self = this;
			self._super(visibility, invoice, clickpos);	
			if(invoice.residual <=0)
				$('.wk_register_payment').hide();
			else
				$('.wk_register_payment').show();
			self.$('.wk_register_payment').on('click',function(e){
				new instance.web.Model('account.invoice').call('read',[invoice.id,['state','amount_total','residual']])
				.then(function(result){
					if(result && result.amount_total &&  result.residual){
						invoice.amount_total = result.amount_total;
						invoice.residual = result.residual;
						self.update_residual_amount(result.residual)
					}
					if(result.residual>0)
						self.pos.pos_widget.screen_selector.show_popup('register_payment',{
							invoice: invoice
						});
				})
				.fail(function(unused, event) {
					self.pos.pos_widget.screen_selector.show_popup('error', {
						message: 'Failed To Register Payment.',
					});
				});
			});
		},
		update_residual_amount: function(amount){
			var self = this;
			$('.invoice-line.wk_highlight td:last-child').text(self.format_currency(amount));
			$('.wk_balance').text(self.format_currency(amount))			
		},
			
	});

	var RegisterPaymentPopup = module.PopUpWidget.extend({
		template:'RegisterPaymentPopup',
		events:{
			'click .cancel_credit_line': 'click_cancel',
			'click .button.register_payment': 'wk_register_payment',
			'click .tab-link': 'wk_change_tab',
			'click .outstanding_credit_line': 'wk_use_outstanding_credit',
			'click .reconsile_line': 'remove_move_reconcile',
		},
		click_cancel: function(){
			var self = this;
			self.pos_widget.screen_selector.close_popup();
			if(self.options && self.options.cancel ){
				self.options.cancel.call(self);
			}
		},
		show:function(options){
			this.options = options|| {}
            this._super(this.options);
			this.renderElement();
		},
		wk_register_payment: function(event){
			var self = this;
			var invoice = self.options.invoice;
			var amount = parseFloat(self.$('.payment_amount').val());
			var payment_memo = self.$('.payment_memo').val();
			var reference = self.$('.payment_reference').val();
			var wk_payment_journal = parseInt(self.$('.wk_payment_journal').val());
			if(amount<=0 || !amount){
                    self.$('.payment_amount').removeClass('text_shake');
                    self.$('.payment_amount').focus();
                    self.$('.payment_amount').addClass('text_shake');
					return;
                }
			else if(self.$('.wk_payment_journal').val() == ""){
				self.$('.wk_payment_journal').removeClass('text_shake');
				self.$('.wk_payment_journal').focus();
				self.$('.wk_payment_journal').addClass('text_shake');
				return;
			}
			else{
				$('.button.register_payment').css('pointer-events', 'none')			
				new instance.web.Model('account.invoice').call('wk_register_invoice_payment',[invoice.id,{
					'amount':amount,
					'payment_memo':payment_memo,
					'reference':reference,
					'journal_id':wk_payment_journal,
					'invoice_id':invoice.id,
					'session_id':self.pos.pos_session.id
				}])
				.then(function(result){
					result = result[0]
					if(result && result.residual>=0){
						self.pos.db.invoice_by_id[invoice.id].residual = parseFloat(result.residual);
						if (result.state)
						self.pos.db.invoice_by_id[invoice.id].state = result.state;
						self.click_cancel();;
						self.update_residual_amount(result.residual);		
					}
					else if(result && result.error){
						self.pos.pos_widget.screen_selector.show_popup('error', {
							message: result.error,
						});
					}
					$('.button.register_payment').css('pointer-events', '')
				})
				.fail(function(unused, event) {
					self.pos.pos_widget.screen_selector.show_popup('error', {
						message: 'Failed To Register Payment.',
					});
					$('.button.register_payment').css('pointer-events', '')		
				});
			}
		},
		update_residual_amount: function(amount){
			var self = this;
			$('.invoice-line.wk_highlight td:last-child').text(self.format_currency(amount));
			$('.wk_balance').text(self.format_currency(amount))			
		},
	});

	module.PosWidget = module.PosWidget.extend({
		build_widgets: function() {
			SuperPosWidget.build_widgets.call(this)
			var self = this;
			this.register_payment = new RegisterPaymentPopup(this, {});
			this.register_payment.appendTo(this.$el);
			this.register_payment.hide();
			this.screen_selector.popup_set['register_payment'] = this.register_payment;
		},
	});	
}