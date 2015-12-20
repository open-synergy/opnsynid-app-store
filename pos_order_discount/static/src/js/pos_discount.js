openerp.pos_order_discount = function(instance){
    var module   = instance.point_of_sale;
    var round_pr = instance.web.round_precision
    var QWeb = instance.web.qweb;
    _t = instance.web._t;

    var _super = module.Order;
    module.Order = module.Order.extend({
        set_discountLine: function(discount){
            if(discount!=undefined)
            {
            
            this.set('discountLine',[[0, 0, {'discount': 0, 'price_unit': -discount['price'], 'product_id': discount['id'], 'qty': 1}]]);
            }
            else
            {
                this.set('discountLine',undefined);
            }
        },
        wk_set_discount:function(discount){
             if(discount!=undefined)
            {
            
            this.set('wkdiscounPrice',discount);
            }
            else{
                 this.set('wkdiscounPrice',undefined);
            }
        },
        get_discountLine: function(){
            return this.get('discountLine');
        },
        wk_get_discount:function(){

            if (this.get('wkdiscounPrice') == undefined){               
                return 0;
            }
            else{
                $(".wk_discount_display").removeClass("discount_cancel");
                return this.get('wkdiscounPrice');
            }

        },
        wk_set_discount_info:function(discount_info){
             if(discount_info!=undefined)
            {
            this.set('wkdiscount_info',discount_info);
            }
            else{
                this.set('wkdiscount_info',undefined);

            }
        },
        wk_get_discount_info:function(){
            var wkdiscount_info=this.get('wkdiscount_info')
            if (wkdiscount_info == undefined){               
                return "";
            }
            else{
               
                if(wkdiscount_info.discount_type=='percent')
                {   
                    return "("+wkdiscount_info.discount_name+" "+wkdiscount_info.discount_value+" %) Discount";
                    
                }
               else{
                   return "("+wkdiscount_info.discount_name+" "+wkdiscount_info.discount_value+" Amount) Discount";
               }
            }
        },
        getPaidTotal: function() {

            disoucnt_fun=this.wk_get_discount()
            

            return round_pr((this.get('paymentLines')).reduce((function(sum, paymentLine) {
                return sum + paymentLine.get_amount()+disoucnt_fun;
            }), 0), this.pos.currency.rounding);
        },
        export_as_JSON: function(){
            var currentOrder = this.pos.get('selectedOrder');
            var json = _super.prototype.export_as_JSON.apply(this,arguments);           
            json.discountLine = this.get_discountLine();
            return json;
        },
        
    });

    module.PaymentScreenWidget =  module.PaymentScreenWidget.extend({
        show: function(){
            this._super();
            var self = this;
            this.add_action_button({
                    label: _t('Discount'),
                    icon: '/pos_order_discount/static/src/img/icon-discount.png',
                    click: function(){  
                        self.wk_discount();
                    },
                });

        },
        renderElement: function() {
            this._super();
            var self = this;
            this.$(".wk_discount_block").click(function(){
                var wkcurrentOrder = self.pos.get('selectedOrder');
                wkcurrentOrder.set_discountLine(undefined);
                wkcurrentOrder.wk_set_discount(undefined);
                wkcurrentOrder.wk_set_discount_info(undefined);
                
                self.update_payment_summary();
                $(".wk_discount_display").addClass("discount_cancel");
               

            });
            
        },
        update_payment_summary: function() {
            this._super();
            var self = this;
            var wkcurrentOrder = this.pos.get('selectedOrder');
            var wkpaidTotal = wkcurrentOrder.wk_get_discount();
            this.$('.discount-charge').html(this.format_currency(wkpaidTotal));
            var paidTotal = wkcurrentOrder.getPaidTotal();
            this.$('.payment-paid-total').html(this.format_currency(paidTotal-wkpaidTotal));
            this.$('.wk_discount-info').html(wkcurrentOrder.wk_get_discount_info());
            

        },
        wk_discount: function(){
                var self = this;
                var wk_discount_list=self.pos.get('discount_list');
                var discount_prodcut_id=self.pos.config.wk_discount_product_id;
                if(! discount_prodcut_id)
                {
                    self.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Warning !!!!"),
                            'comment': _t("You have not choosen any Discount product. Please choose Discount Product in corresponding POS Session" ),
                    });
                }
                // else if(wk_discount_list.length==1)
                // {   
                //     // var product = self.pos.db.get_product_by_id(discount_prodcut_id[0]);
                //     // if(product)
                //     // {
                    
                //     //  self.pos.get('selectedOrder').addProduct(product);
                //     // }
                    
                // }
                else if(wk_discount_list.length >=1)
                    {
                    self.pos_widget.screen_selector.show_popup('select-discount');
                   
                    $('#wk_discount-cance').click(function(){
                    self.pos_widget.screen_selector.set_current_screen('payment');
                    });

                    }
                else
                {

                    self.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Warning !!!!"),
                            'comment': _t("You have not choosen any Discount. Please choose Discount in corresponding POS Session" ),
                    });
                }

        },
        
    });

    module.DiscountWidget = module.PosBaseWidget.extend({
        template: 'DiscountWidget',

        init: function(parent, options) {
            this._super(parent,options);
            this.model = options.model;
        },
        renderElement: function() {
            this._super();
            var self = this;
            var discount_prodcut_id=self.pos.config.wk_discount_product_id;
            var wk_discount_list=self.pos.get('discount_list');
            var wk_discount=0;
            var discount_price=0;
            var currentOrder = self.pos.get('selectedOrder');
            var discount_offer=0;
            $("a", this.$el).click(function(e){
                $(".wk_discount_display").removeClass("discount_cancel");
                self.pos_widget.screen_selector.set_current_screen('payment');
                for(i=0;i<wk_discount_list.length;i++)
                {   
                    if(wk_discount_list[i].id==self.model.id)
                    {
                    wk_discount=wk_discount_list[i];
                    break;
                    }

                }
                if(wk_discount.discount_on=='tax_inclusive'){ 
                     discount_offer = currentOrder.getTotalTaxIncluded();
                }
                else{
                    discount_offer = currentOrder.getTotalTaxExcluded();
                }
                if(wk_discount.discount_type=='percent')
                {   
                    
                    discount_price=(discount_offer/100)*wk_discount.discount_method;
                    
                }
               else{
                   
                    if(wk_discount.discount_method > discount_offer)
                        discount_price=discount_offer;
                    else
                        discount_price=wk_discount.discount_method;
               }
               
               
                self.pos.get('selectedOrder').set_discountLine({'price': discount_price,'id':discount_prodcut_id[0]});
                self.pos.get('selectedOrder').wk_set_discount(discount_price);
                self.pos.get('selectedOrder').wk_set_discount_info({"discount_type":wk_discount.discount_type,"discount_value":wk_discount.discount_method,"discount_name":wk_discount.name});

                self.pos_widget.screen_selector.set_current_screen('payment');
                self.wk_update_pay_summery();
                
            });
        },
        wk_update_pay_summery:function(){
            self=this;
            var format=self.pos_widget;
            var currentOrder = this.pos.get('selectedOrder');
            var paidTotal = currentOrder.getPaidTotal();
            var dueTotal = currentOrder.getTotalTaxIncluded();
            var remaining = dueTotal > paidTotal ? dueTotal - paidTotal : 0;
            var change = paidTotal > dueTotal ? paidTotal - dueTotal : 0;
            var discount=currentOrder.wk_get_discount();
            $('.payment-due-total').html(format.format_currency(dueTotal));
            $('.payment-paid-total').html(format.format_currency(paidTotal-discount));
            $('.payment-remaining').html(format.format_currency(remaining));
            $('.payment-change').html(format.format_currency(change));
            $('.discount-charge').html(format.format_currency(discount));
            $('.wk_discount-info').html(currentOrder.wk_get_discount_info());
            

        },
        get_discount_image_url: function(discount_id){

            return window.location.origin + '/web/binary/image?model=pos.order.discount&field=file&id='+discount_id;
        },
        
    });

    module.DiscountScreenWidget = module.ScreenWidget.extend({
        template:'DiscountScreenWidget',

        init: function(parent, options) {
            this._super(parent,options);
           
        },

        start: function() {
            this._super();
            var self = this;
        },


        renderElement: function() {
            this._super();
            var self = this;
            var discounts = self.pos.get('discount_list') || [];
            for(var i = 0;i < discounts.length;  i++ ){
                var wk_discount = new module.DiscountWidget(this, {
                    model: discounts[i],
                });
               
                wk_discount.appendTo(this.$('.discount_list'));
            }

           
        },

        
    }),



    module.DiscountPopupWidget = module.PopUpWidget.extend({
        template:'DiscountPopupWidget',
        
        start: function(){
            this._super();
            var self = this;
           this.discount_list_widget = new module.DiscountScreenWidget(this,{});
        },

        show: function(){
            this._super();
            var self = this; 
            this.discount_list_widget.replace($('.placeholder-DiscountListScreenWidget'));       
        },
    });

    module.PosWidget = module.PosWidget.extend({
        build_widgets: function(){
            this._super();
            var self = this;
            

            this.product_popup = new module.DiscountPopupWidget(this, {});
            this.product_popup.appendTo(this.$el);
            this.product_popup.hide();
            this.screen_selector.popup_set['select-discount'] = this.product_popup;   

            
        },
    });

    var PosModelSuper = module.PosModel
    module.PosModel = module.PosModel.extend({
    load_server_data: function(){
        var self = this;
        var loaded = PosModelSuper.prototype.load_server_data.call(this);       
        loaded = loaded.then(function(){
                    if(self.config.wk_discounts)
                    {
                        return self.fetch(
                                'pos.order.discount',
                                ['name','discount_method','discount_type','id','short_description','discount_on'],
                                [['id', 'in',self.config.wk_discounts]])
                        .then(function(discount){                           
                            self.set({'discount_list' : discount});
                        });
                    }
                    else{
                        self.set({'discount_list' :[]});
                    }
                });
        return loaded;
        },
    });

};

