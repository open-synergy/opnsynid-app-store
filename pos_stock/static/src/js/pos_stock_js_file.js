openerp.pos_stock = function(instance, module){
module = instance.point_of_sale;
_t = instance.web._t;
var round_pr = instance.web.round_precision



var _initialize_ = module.PosModel.prototype.initialize;
module.PosModel.prototype.initialize = function(session, attributes){
        self = this;

        
        for (var i = 0 ; i < this.models.length; i++){
            if (this.models[i].model == 'product.product'){
                
                    this.models[i]={
            model:  'product.product',
            fields: ['display_name', 'list_price','price','pos_categ_id', 'taxes_id', 'ean13', 'default_code', 
                     'to_weight', 'uom_id', 'uos_id', 'uos_coeff', 'mes_type', 'description_sale', 'description',
                     'product_tmpl_id'],
            domain: [['sale_ok','=',true],['available_in_pos','=',true]],
            context: function(self){ return { pricelist: self.pricelist.id, display_default_code: false }; },
            loaded: function(self, products){
                self.db.add_products(products);
                (new instance.web.Model('pos.config')).call('wk_pos_fetch_pos_stock',[{'pos_config_id':self.config.id}])  
                    
                .then(function (result) { 
                    self.set({'wk_product_qtys' : result});
                });
            },
        }
                }        
    }
    

    return _initialize_.call(this, session, attributes);
};

var PosModelSuper = module.PosModel
    module.PosModel = module.PosModel.extend({
     
        push_and_invoice_order: function(order){
            var self=this;
            if(order != undefined)
            {
            var wk_order_line=order.get('orderLines');
         
            for(j=0;j<wk_order_line.length;j++)
            {
                self.get('wk_product_qtys')[wk_order_line.models[j].product.id] = self.get('wk_product_qtys')[wk_order_line.models[j].product.id] - wk_order_line.models[j].quantity;         
            }
            }
            var push = PosModelSuper.prototype.push_and_invoice_order.call(this,order);
            return push;
        },

        push_order: function(order) {
            var self = this;
            if(order != undefined)
            {
            var wk_order_line=order.get('orderLines');
         
            for(j=0;j<wk_order_line.length;j++)
            {
                self.get('wk_product_qtys')[wk_order_line.models[j].product.id] = self.get('wk_product_qtys')[wk_order_line.models[j].product.id] - wk_order_line.models[j].quantity;         
            }
             }
            var push = PosModelSuper.prototype.push_order.call(this,order);
            return push;
         },
    });



module.PosBaseWidget.include({

    get_information: function(wk_product_id){
                self=this;
                return self.pos.get('wk_product_qtys')[wk_product_id];
        },

    wk_change_qty_css:function()
        {
            self=this;
            var wk_order=self.pos.get('orders');
            var wk_p_qty=new Array();
            var wk_product_obj=self.pos.get('wk_product_qtys');
             
            for(var i in wk_product_obj) {

                wk_p_qty[i]=self.pos.get('wk_product_qtys')[i];
                
            }
            for(i=0;i< wk_order.length;i++)
                {  
                    var wk_order_line=wk_order.models[i].get('orderLines')
                    for(j=0;j<wk_order_line.length;j++)
                    {
                   
                        wk_p_qty[wk_order_line.models[j].product.id] =wk_p_qty[wk_order_line.models[j].product.id] - wk_order_line.models[j].quantity;
                        $("#qty-tag"+wk_order_line.models[j].product.id).html(wk_p_qty[wk_order_line.models[j].product.id]);
                         
                    }
                }
            
        }

    });

var PosOrderSuper = module.Order
module.Order =module.Order.extend({
    template:'Order',
    addProduct: function(product, options){
        var self = this;
        if(!self.pos.config.wk_continous_sale && self.pos.config.wk_display_stock)
        {
            if(parseInt($("#qty-tag"+product.id).html()) < = self.pos.config.wk_deny_val){
                self.pos.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Warning !!!!"),
                            'comment': _t("("+product.display_name+")"+self.pos.config.wk_error_msg+"."),
                        });
            }
            else{
               
                 PosOrderSuper.prototype.addProduct.call(this,product, options);
            }
        }
        else {
            PosOrderSuper.prototype.addProduct.call(this,product, options);
        }
        if(self.pos.config.wk_display_stock)
        {
        self.pos.pos_widget.wk_change_qty_css();
        }

    },
});

var PosOrderlineSuper = module.Orderline
module.Orderline=module.Orderline.extend({
        template:'Orderline',
        set_quantity: function(quantity){
            var self = this;
            wk_avail_pro=0;
            wk_pro_order_line=(this.pos.get('selectedOrder')).getSelectedLine().get_quantity();
            if(!self.pos.config.wk_continous_sale && self.pos.config.wk_display_stock)
            {        
                wk_current_qty=parseInt($("#qty-tag"+(this.pos.get('selectedOrder')).getSelectedLine().product.id).html())
                if(quantity == '' || quantity == 'remove')
                    {
                    wk_avail_pro=wk_current_qty + wk_pro_order_line 
                    }
                else{
                    wk_avail_pro=wk_current_qty + wk_pro_order_line - quantity;
                    }

                if(wk_avail_pro < self.pos.config.wk_deny_val && (!(quantity == '' || quantity == 'remove'))){
                    
                    this.pos.pos_widget.screen_selector.show_popup('error',{
                                        'message': _t("Warning !!!!"),
                                        'comment': _t("("+(this.pos.get('selectedOrder')).getSelectedLine().product.display_name+") "+self.pos.config.wk_error_msg+"."), 
                    });

                    }
                else{
                    
                    PosOrderlineSuper.prototype.set_quantity.call(this,quantity);  
                    }
                }
            else{
                PosOrderlineSuper.prototype.set_quantity.call(this,quantity);     
            }    
            if(self.pos.config.wk_display_stock)
            {
            this.pos.pos_widget.wk_change_qty_css();
            }
        },
});

}