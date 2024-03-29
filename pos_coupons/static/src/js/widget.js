function pos_coupons_widget(instance, module){
    var QWeb = instance.web.qweb;
    _t = instance.web._t;
    var round_di = instance.web.round_decimals;

    module.PosWidget.include({
        build_widgets: function() {
            this._super();
            var self = this;
            this.coupon_popup_widget = new module.CouponPopupWidget(this, {});
            this.coupon_popup_widget.appendTo(this.$el);
            this.coupon_popup_widget.hide();
            this.screen_selector.popup_set['coupon_popup_widget'] = this.coupon_popup_widget;

            this.create_coupon_popup_widget = new module.CreateCouponPopupWidget(this, {});
            this.screen_selector.popup_set['create_coupon_popup_widget'] = this.create_coupon_popup_widget;
            this.create_coupon_popup_widget.appendTo(this.$el);
            this.create_coupon_popup_widget.hide();
                                    
            this.redeem_coupon_popup_widget = new module.RedeemPopupWidget(this, {});
            this.redeem_coupon_popup_widget.appendTo(this.$el);
            this.redeem_coupon_popup_widget.hide();
            this.screen_selector.popup_set['redeem_coupon_popup_widget'] = this.redeem_coupon_popup_widget;

            this.redeem_coupon_retry_popup_widget =new module.RedeemPopupRetryWidget(this, {});
            this.redeem_coupon_retry_popup_widget.appendTo(this.$el);
            this.redeem_coupon_retry_popup_widget.hide();
            this.screen_selector.popup_set['redeem_coupon_retry_popup_widget'] = this.redeem_coupon_retry_popup_widget;

            this.redeem_coupon_validate_popup_widget = new module.RedeemPopupValidateWidget(this, {});
            this.redeem_coupon_validate_popup_widget.appendTo(this.$el);
            this.redeem_coupon_validate_popup_widget.hide();
            this.screen_selector.popup_set['redeem_coupon_validate_popup_widget'] = this.redeem_coupon_validate_popup_widget;

            this.create_confirm_screen = new module.CreateConfurmPopupWidget(this, {});
            this.create_confirm_screen.appendTo(this.$el);
            this.create_confirm_screen.hide();
            this.screen_selector.popup_set['create_confirm_screen'] = this.create_confirm_screen;
        },
        start: function() {
            var self = this;
            this._super();
            return self.pos.ready.done(function() {
                self.$('#btn_manage_coupon').click(function(){
                    self.pos_widget.screen_selector.show_popup('coupon_popup_widget');
                });
            });
        }
    });

    module.CouponPopupWidget = module.PopUpWidget.extend({
        template: 'CouponPopupWidget',
        
          renderElement: function() {
            var self = this;
            this._super();
            this.$('#gift-coupons-create').click(function(){
            if(self.pos.user.allow_coupon_create){
                self.pos_widget.screen_selector.show_popup('create_coupon_popup_widget',{});
            }
            else{
                alert("Access denied please contact your Administrator.");
            }
            });
            this.$('#gift-coupons-redeem').click(function(){                
                self.pos_widget.screen_selector.show_popup('redeem_coupon_popup_widget',{});
            });
            this.$('.cancel').off('click').click(function(){
                self.pos_widget.screen_selector.close_popup();
            });
        },
      });

    module.CreateConfurmPopupWidget = module.PopUpWidget.extend({
        template:'CreateConfurmPopupWidget',
        show: function(wk_obj){
            this._super();
            var self = this;
            var currentOrder = self.pos.get('selectedOrder');
            this.$('#print-coupons').off('click').click(function(){
                if (self.pos.config.iface_print_via_proxy){
                    (new instance.web.Model('voucher.voucher')).call('get_coupon_data',[wk_obj.wk_id])  
                        .then(function (result) {
                            var receipt = currentOrder.export_for_printing();
                            receipt['coupon'] = result;
                            var t = QWeb.render('CouponXmlReceipt',{
                                receipt: receipt, widget: self,
                            });
                            self.pos.proxy.print_receipt(t);
                        });
                    self.pos_widget.screen_selector.close_popup();
                }else{
                    (new instance.web.Model('voucher.voucher')).call('wk_print_report')
                    .then(function (result) {
                            instance.client.action_manager.do_action(result,{additional_context:{active_id:wk_obj.wk_id,active_ids:[wk_obj.wk_id],active_model:'pos.coupons'}})
                    })
                    .fail(function (error, event){
                        event.preventDefault();
                        self.pos_widget.screen_selector.show_popup('error',{
                            'title': _t('Error: Could not Save Changes'),
                            'body': _t('Your Internet connection is probably down.'),
                        });
                     }); 
                    self.pos_widget.screen_selector.close_popup();
                }
            });
            this.$('.button.cancel').off('click').click(function(){
                self.pos_widget.screen_selector.close_popup();
            });
        },
    });

    module.CreateCouponPopupWidget = module.PopUpWidget.extend({
        template: 'CreateCouponPopupWidget',
        saveBackend:function(name, validity, availability, coupon_value, note, customer_type, partner_id, voucher_usage, amount_type, max_expiry_date, redeemption_limit,partial_redeem){
            self=this;
            (new instance.web.Model('voucher.voucher')).call('create_coupons',[{ 'name': name, 'validity': validity, 'total_available': availability, 'coupon_value': coupon_value, 'note': note, 'customer_type': customer_type, 'partner_id': partner_id, 'voucher_usage': voucher_usage, 'amount_type': amount_type, 'max_expiry_date': max_expiry_date, 'redeemption_limit': redeemption_limit ,'partial_redeem':partial_redeem}])
                .fail(function(unused, event){
                    alert('Connection Error. Try again later !!!!');
            })
            .done(function(result){
            self.pos_widget.screen_selector.show_popup('create_confirm_screen',{
                            'wk_id':result,
                    });
            });
        },
        renderElement: function() {
            var self = this;
            this._super();
            var wk_config=self.pos.get('wk_coupon_config');
            if(wk_config != false)
            {
                self.$("input[name=wk_coupon_name]").val(wk_config[0].default_name || '');
                self.$("input[name=wk_coupon_validity]").val(wk_config[0].default_validity); 
                self.$("input[name=wk_coupon_availability]").val(wk_config[0].default_availability);
                self.$("input[name=wk_coupon_value]").val(wk_config[0].default_value);
                self.$("select[name=wk_customer_type]").val(wk_config[0].customer_type);
                self.$("input[name=wk_redeemption_limit]").val(wk_config[0].partial_limit);
                self.$("#wk_partial_redeemed").attr('checked', wk_config[0].partially_use);
            }
            this.$('.wk_create_coupon_button').click(function(){
    
                function isNumber (o) {
                    return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
                }
                var wk_config=self.pos.get('wk_coupon_config');
                var order = self.pos.get('selectedOrder');
                    if(wk_config== false)
                    {
                        alert("Coupon Configuration is Required");
    
                    }
                    else{
                        $("input[name=wk_coupon_name]").removeClass("wk_text_error");
                        $("input[name=wk_coupon_validity]").removeClass("wk_text_error");
                        $("input[name=wk_coupon_availability]").removeClass("wk_text_error");
                        $("input[name=wk_coupon_value]").removeClass("wk_text_error");
                        $("input[name=wk_coupon_value]").removeClass("wk_text_error");
                        $("select[name=wk_customer_type]").removeClass("wk_text_error");
                        $("select[name=wk_coupon_usage]").removeClass("wk_text_error");
                        $("input[name=wk_redeemption_limit]").removeClass("wk_text_error");
                        $("select[name=wk_partner_id]").removeClass("wk_text_error");
                        $("select[name=wk_amount_type]").removeClass("wk_text_error");
                        $('.wk_valid_error').html("");
                        var name = $("input[name=wk_coupon_name]").val();
                        var validity = $("input[name=wk_coupon_validity]").val();
                        var availability = $("input[name=wk_coupon_availability]").val();
                        var coupon_value = $("input[name=wk_coupon_value]").val();
                        var note = $("textarea[name=note]").val();
                        var customer_type = $("select[name=wk_customer_type]").val();
                        var voucher_usage = $("select[name=wk_coupon_usage]").val();
                        var redeemption_limit = $("input[name=wk_redeemption_limit]").val();
                        var partial_redeem = $("#wk_partial_redeemed").is(":checked");
                        var amount_type = $("select[name=wk_amount_type]").val();
                        var max_expiry_date = wk_config[0].max_expiry_date;
                        if (name != '') {
                            if (isNumber(validity)) {
                                if (isNumber(availability) && availability !=0) {
                                    if (isNumber(coupon_value) && coupon_value != 0) {
                                        if (!(amount_type == 'percent' && (coupon_value < 0 ||  coupon_value > 100)))
                                        {
                                        if (parseInt(coupon_value) >= wk_config[0].min_amount && parseInt(coupon_value) <= wk_config[0].max_amount) 
                                        {
                                            if (customer_type == 'special_customer') {
                                                if (order.get_client() == null) {
                                                    self.gui.show_popup('error', {
                                                        'title': _t('Error !!!'),
                                                        'body': _t("Please Select Customer!!!!"),
                                                        });
                                                }else
                                                {
                                                    if (partial_redeem == true) {
                                                        if (redeemption_limit == 0)
                                                            $('.valid_error_redeeemption').html("This field is required & should not be 0");
                                                        else {
                                                            self.saveBackend(name, validity, availability, coupon_value, note, customer_type, order.get_client().id, voucher_usage, amount_type, max_expiry_date, redeemption_limit,partial_redeem);
                                                        }
    
                                                    }
                                                    else
                                                        self.saveBackend(name, validity, availability, coupon_value, note, customer_type, order.get_client().id, voucher_usage, amount_type, max_expiry_date, -1,false);
                                                }
                                            }else
                                                self.saveBackend(name, validity, availability, coupon_value, note, customer_type, false, voucher_usage, amount_type, max_expiry_date, -1,false);
                                        }
                                        else
                                        {
                                            if (parseInt(coupon_value) < wk_config[0].min_amount)
                                                $("input[name=wk_coupon_value]").parent().find('.wk_valid_error').html("(Min. allowed value is " + wk_config[0].min_amount + ")");
                                            else
                                               $("input[name=wk_coupon_value]").parent().find('.wk_valid_error').html("(Max. allowed value is " + wk_config[0].max_amount + ")");
                                        }
                                    }else{
                                        $("input[name=wk_coupon_value]").parent().find('.wk_valid_error').html("Must be > 0 & <=100");
                                    }
                                    }else
                                    {
                                        $("input[name=wk_coupon_value]").addClass("wk_text_error");
                                        /*$('.wk_valid_error').html("Value should be >=0");*/
                                        $("input[name=wk_coupon_value]").parent().find('.wk_valid_error').html("Value should be >=0");
                                    }
                                }else
                                {
                                    $("input[name=wk_coupon_availability]").addClass("wk_text_error");
                                    $("input[name=wk_coupon_availability]").parent().find('.wk_valid_error').html("Validity can't be 0");
                                }
                            } else
                                $("input[name=wk_coupon_validity]").addClass("wk_text_error");
                        } else 
                            $("input[name=wk_coupon_name]").addClass("wk_text_error");
                    }
            });
            this.$('.button.cancel').off('click').click(function(){
                self.pos_widget.screen_selector.close_popup();
            });
        }, 
      });

    module.RedeemPopupRetryWidget = module.PopUpWidget.extend({
        template:'RedeemPopupRetryWidget',
        show: function(options){
            this._super(options);
            self.$('.wk_coupon_title').text(options.title);
           },
        renderElement: function() {
            var self = this;
            this._super();
            this.$('#wk-retry-coupons').click(function(){
                self.pos_widget.screen_selector.show_popup('redeem_coupon_popup_widget',{});    
            });
            this.$('.button.cancel').off('click').click(function(){
                self.pos_widget.screen_selector.close_popup();
            });
        },
    });

    module.RedeemPopupValidateWidget = module.PopUpWidget.extend({
        template:'RedeemPopupValidateWidget',

        show: function(options){
            var self = this;
            this._super(options);
            self.wk_product_id = options.wk_product_id;
            self.secret_code = options.secret_code;
            self.total_val = options.total_val;
            self.coupon_name = options.coupon_name
            self.$('.wk_coupon_key_label').text(options.title);
           },
        renderElement: function() {
            var self = this;
            this._super();
            var selectedOrder = self.pos.get('selectedOrder');
            this.$('#wk-retry-coupons').click(function(){
                (new instance.web.Model('voucher.voucher')).call('redeem_voucher_create_histoy',[self.coupon_name, self.secret_code, self.total_val, false, false,'pos'])
                    .fail(function(unused, event){
                        alert('Connection Error. Try again later !!!!');
                })
                .done(function(result){
                    if(result['status']){
                        selectedOrder.coupon_id = self.secret_code;
                        selectedOrder.wk_product_id = self.wk_product_id;
                        selectedOrder.wk_voucher_value = self.total_val;
                        selectedOrder.history_id = result['history_id'];
                        var product = self.pos.db.get_product_by_id(self.wk_product_id);
                        selectedOrder.addProduct(product, {price:-(self.total_val)});
                        self.pos_widget.screen_selector.close_popup();
                    }
                });
            });
        },
    });

    module.RedeemPopupWidget = module.PopUpWidget.extend({
        template:'RedeemPopupWidget',
        init: function(options){
            this._super(options);
        },
        show: function(options) {
            var self = this;
            var order = self.pos.get('selectedOrder');
            var orderlines = order.get('orderLines');
            console.log(orderlines);
            var coupon_product = true;
            var prod_list = []
            var selected_prod_percent_price = 0
            for (var i = 0; i < orderlines.models.length; i++)
            {
                prod_list.push(orderlines.models[i].product.id);
            }
            this._super();
            this.renderElement();
            this.$('#wk-redeem-coupons').click(function(){
                var secret_code = $("#coupon_8d_code").val();

                (new instance.web.Model('voucher.voucher')).call('validate_voucher',[secret_code, order.getTotalTaxIncluded(), prod_list,'pos' ,order.get_client()?order.get_client().id:0])
                .fail(function(unused, event){
                    alert('Connection Error. Try again later !!!!');
                })
                .done(function(result){
                    console.log(result.product_id);
                    if(orderlines.models.length){
                        for(var i=0;i < orderlines.models.length;i++){
                            if(orderlines.models[i].product.id == result.product_id){
                                coupon_product = false;
                            }
                            if (result.product_ids !== undefined){
                                if ($.inArray(orderlines.models[i].product.product_tmpl_id, result.product_ids) !== -1)
                                {
                                    selected_prod_percent_price += orderlines.models[i].price * orderlines.models[i].quantity;
                                }
                            }
                        }
                        if (coupon_product){
                            if (result.status) {
                                var total_amount = order.getTotalTaxIncluded();
                                var msg;
                                var total_val;
                                var res_value = result.value;
                                if (result.customer_type == 'general') {
                                    if (result.voucher_val_type == 'percent'){
                                        res_value = (total_amount * result.value) / 100;
                                        if (result.applied_on == 'specific')
                                            res_value = (selected_prod_percent_price * result.value) / 100;
                                        else
                                            total_amount = res_value;
                                    }
                                    else
                                    {
                                        if (result.applied_on == 'specific')
                                            total_amount = selected_prod_percent_price
                                    }
                                }
                                console.log('---------total_amount------',total_amount);
                                if (total_amount < res_value) {
                                    msg = total_amount;
                                    total_val = total_amount;
                                } else {
                                    msg = res_value;
                                    total_val = res_value;
                                }
                                msg = parseFloat(round_di(msg, 2).toFixed(2));
                                console.log('-----------fff-------',msg);
                                self.pos_widget.screen_selector.show_popup('redeem_coupon_validate_popup_widget',{
                                    'title': _t(result.message),
                                    'msg':_t(msg),
                                    'wk_product_id':result.product_id,
                                    'secret_code':result.coupon_id,
                                    'total_val':total_val,
                                    'coupon_name':result.coupon_name,
                                });
                            }
                            else{
                                self.pos_widget.screen_selector.show_popup('redeem_coupon_retry_popup_widget',{
                                    'title': _t(result.message), 
                                });
                            }
                        }
                        else{
                            self.pos_widget.screen_selector.show_popup('error',{
                                message: _t('Error!!!'),
                                comment: _t("Sorry, you can't use more than one coupon in single order"),
                            });
                        }
                    }
                    else{
                        self.pos_widget.screen_selector.show_popup('error',{
                            message: _t('Error!!!'),
                            comment: _t("Sorry, there is no product in order line."),
                        });

                    }
                });
            });
            this.$('.button.cancel').off('click').click(function(){
                self.pos_widget.screen_selector.close_popup();
            });
        },
    });

};
