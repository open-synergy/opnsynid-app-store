openerp.pos_operation_restrict = function(instance) {
	var module = instance.point_of_sale;
	var _t = instance.web._t;
	var QWeb = instance.web.qweb;

	var round_di = instance.web.round_decimals;
	var round_pr = instance.web.round_precision;

	var models = module.PosModel.prototype.models;
	for (var i = 0; i < models.length; i++) {
		var model = models[i];
		if (model.model === 'res.users') {
			model.fields.push('pin','can_give_discount','can_change_price');
		}if (model.model === 'res.company') {
			model.fields.push('admin_pin');
		}
	}

	module.PosWidget.include({
		build_widgets : function() {
			var self = this;
			this._super();
			var pos = this.pos;
			var move = false;

			var users = self.pos.users;
		    var user = self.pos.user;

			this.custom_dialog_box = new module.CustomPopup(this, {});
			this.custom_dialog_box.appendTo(this.$el);
			this.screen_selector.popup_set['custom_dialog_box'] = this.custom_dialog_box;
			this.custom_dialog_box.hide();

			$('.mode-button').click(function() {
		        var mode = $(this).attr("data-mode");
		        if(mode=="discount" && user.id != 1){
	        		if(! pos.get('selectedOrder').getSelectedLine()){
	        			alert(_t("Please select atleast one product!"));
						self.pos_widget.numpad.state.reset();
						return
	        		}
	        		var msg_show = "";
	        		$.each( users, function( key, val ){
	        			if(val.id == user.id) {
		        			if(!val.can_give_discount) {
		        				msg_show += "<script>$('.admin_input').focus();" +
		        						"$('input').keypress(function(e) {if(e.which == 13)" +
		        						" {$('.button.ok').click();}});</script>" +
		        						"<p id='title' style='color: black;'>Enter Admin PIN</p><hr></hr><div>" +
		        						"<input style='margin-top: 35px;' class='admin_input' type='password' name='admin_pin' id="+val.id+" placeholder='Enter Admin PIN'></div>";
		        				self.pos_widget.screen_selector.show_popup('custom_dialog_box',{msg_show : msg_show});
		        			}
	        			}
					});
			    }
		        if(mode=="price" && user.id != 1){
	        		if(! pos.get('selectedOrder').getSelectedLine()){
	        			alert(_t("Please select atleast one product!"));
						self.pos_widget.numpad.state.reset();
						return
					}
	        		var msg_show = "";
	        		$.each( users, function( key, val ){
	        			if(val.id == user.id){
		        			if(!val.can_change_price){
		        				msg_show += "<script>$('.admin_input').focus();" +
		        						"$('input').keypress(function(e) {if(e.which == 13)" +
		        						" {$('.button.ok').click();}});</script>" +
		        						"<p id='title' style='color: black;'>Enter Admin PIN</p><hr></hr><div>" +
		        						"<input style='margin-top: 35px;' class='admin_input' type='password' name='admin_pin' id="+val.id+" placeholder='Enter Admin PIN'></div>";
		        				self.pos_widget.screen_selector.show_popup('custom_dialog_box',{msg_show : msg_show});
		        			}
	        			}
					});
		        }
		    });
		},
	});

	module.CustomPopup = instance.point_of_sale.PopUpWidget.extend({
		template : 'CustomPopup',
		show : function(options) {
			var self = this;
			var users = self.pos.users;
			this.msg_show = options.msg_show || "";
			this._super();
			this.renderElement();
			this.$('.button.ok').click(function() {
				var id = "";
				var txt_pin = "";
				var id = $('.admin_input').attr('id');
				var txt_pin = $('#'+id).val();
				if(txt_pin.length == 0 ){
					return alert(_t("Pin can not be blank"))
				}
				$.each( users, function( key, val ){
					if(val.id===1) {
						if(self.pos.company.admin_pin === txt_pin){
							self.pos_widget.screen_selector.close_popup();
						}else{
							alert(_t("Invalid Pin"));
						}
					}
				});
			});

			this.$('.button.cancel').click(function() {
				self.pos_widget.numpad.state.reset();
				self.pos_widget.screen_selector.close_popup();
			});
		},
	});
}
