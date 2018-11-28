function pos_coupons_models(instance, module){
    var _super = module.Order;
    var PosModelSuper = module.PosModel
    var _initialize_ = module.PosModel.prototype.initialize;

    module.PosModel.prototype.initialize = function(session, attributes){
        self = this;
        for (var i = 0 ; i < this.models.length; i++){
            if (this.models[i].model == 'res.users'){
                if (this.models[i].fields.indexOf('allow_coupon_create') == -1) {
                    this.models[i].fields.push('allow_coupon_create');
                }
            }
        }
        return _initialize_.call(this, session, attributes);
    };

    module.Order = module.Order.extend({
        initialize: function(attributes){
                this.coupon_id = 0;
                this.wk_product_id = 0;
                this.history_id = 0;
                _super.prototype.initialize.apply(this,arguments);
                /*this.set({
                    coupon_id:0,
                    wk_product_id:0,
                });*/
            },
        export_as_JSON: function(){
            var json = _super.prototype.export_as_JSON.apply(this,arguments);
             var order = this.pos.get('selectedOrder');
            
              if (order != null)
                {
                var orderlines = order.get('orderLines');
                var coupon_state = true;
                for(var i=0;i < orderlines.models.length; i++){
                    if(orderlines.models[i].product.id == order.wk_product_id){
                        coupon_state=false;
                        }
                }
                if(coupon_state){
                json.coupon_id = 0;
                }
                else{
                    json.coupon_id = order.coupon_id || 0;
                    }
                }
            return json;
        },
    });

    module.PosModel = module.PosModel.extend({
        load_server_data: function(){
            var self = this;
            var loaded = PosModelSuper.prototype.load_server_data.call(this);
            loaded = loaded.then(function(){
                return self.fetch('voucher.config',[],[['active','=',true]])
                .then(function(wk_coupon_config){
                    self.set({'wk_coupon_config' : wk_coupon_config});

                });

            });
            return loaded;
        },
       _save_to_server: function (orders, options) {
            if (!orders || !orders.length) {
                var result = $.Deferred();
                result.resolve([]);
                return result;
            }
            options = options || {};
            var self = this;
            var timeout = typeof options.timeout === 'number' ? options.timeout : 7500 * orders.length;
            var posOrderModel = new instance.web.Model('pos.order');
            return posOrderModel.call('create_from_ui',
                [_.map(orders, function (order) {
                    order.to_invoice = options.to_invoice || false;
                    return order;
                })],
                undefined,
                {
                    shadow: !options.to_invoice,
                    timeout: timeout
                }
            ).then(function (server_ids) {
                /*-------------CODE FOR POS VOUCHERS START------*/
            if (server_ids)
             {
             var wk_order = self.get_order();
             var coupon_id = wk_order.coupon_id;
             var wk_product_id   =  wk_order.wk_product_id;
             var wk_voucher_value = wk_order.wk_voucher_value;
             var orderlines = wk_order.get('orderLines');
             for(var i=0;i < orderlines.models.length; i++){
                    if(orderlines.models[i].product.id == wk_product_id){
                        var  client_id = false;
                        if (wk_order.get_client())
                        {
                            client_id = wk_order.get_client().id
                        }

                         (new instance.web.Model('voucher.voucher')).call('pos_create_histoy',[coupon_id, wk_voucher_value, server_ids[0], orderlines.models[i].id, client_id])
                            .fail(function(unused, event){
                                alert('Connection Error. Try again later !!!!');
                        })
                        .done(function(result){
                        });   

                     }
                }
            }
             /*-------------CODE FOR POS VOUCHERS END------*/
                _.each(orders, function (order) {
                    self.db.remove_order(order.id);
                    if(order.data.coupon_id != 0 && order.data.redeemed_value != null)
                    {
                        (new instance.web.Model('pos.coupons')).call('redeem_coupon',[order.data.coupon_id,order.data.redeemed_value])
                        .fail(function(unused, event){
                            alert('Connection Error! Could not update coupon record!!');
                        })
                    }
                });
                return server_ids;
            }).fail(function (error, event){
                if(error.code === 200 ){    // Business Logic Error, not a connection problem
                    self.pos_widget.screen_selector.show_popup('error-traceback',{
                        message: error.data.message,
                        comment: error.data.debug
                    });
                }
                event.preventDefault();
                console.error('Failed to send orders:', orders);
            });
        },
    });

};

