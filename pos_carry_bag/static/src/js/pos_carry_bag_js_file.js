function wk_openerp_pos_return_bag(instance, module){
module = instance.point_of_sale;
var QWeb = instance.web.qweb;
_t = instance.web._t;
var OrderSuper = module.ProductListWidget;

 module.PaypadWidget = module.PaypadWidget.extend({
        template: 'PaypadWidget',
        renderElement: function() {
            
            var self = this;
            this._super();

            // _.each(this.pos.cashregisters,function(cashregister) {
               var button = new module.CarryBagButtonWidget(self);
                button.insertAfter('.pos .pos-content .pos-leftpane .window .subwindow-container .subwindow-container-fix .control-buttons');
            // });
        }
    });

     module.CarryBagButtonWidget =module.PosBaseWidget.extend({
        template: 'CarryBagButtonWidget',

        init: function(parent, options){
            this._super(parent, options);
            
        },
        renderElement: function() {
            var self = this;
            this._super();

            this.$el.click(function(options){

                var carry_bag_product_list=self.pos.get('carry_bag_product_list');
                
                if(carry_bag_product_list )
                {
                    
                    if(carry_bag_product_list.length==0)
                    {
                        self.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Warning !!!!"),
                            'comment': _t("No product(s) found for Category("+self.pos.get('return_bag_category_name')+") choosen in the POS Session. Plese add product(s) into this category to proceed"),
                        });
                    }
                    else if(carry_bag_product_list.length==1)
                    {   
                        var product = self.pos.db.get_product_by_id(carry_bag_product_list[0].id);
                        if(product)
                        {
                        
                         self.pos.get('selectedOrder').addProduct(product);
                        }
                        else{
                             
                             
                             self.pos.get('selectedOrder').addProduct(carry_bag_product_list[0],{price:carry_bag_product_list[0].list_price})
                             

                        }
                    }
                    else if(carry_bag_product_list.length >=1)
                    {
                        for(i=0;i<carry_bag_product_list.length;i++)
                        {
                        var product = self.pos.db.get_product_by_id(carry_bag_product_list[i].id);
                        if(! product)
                        { 
                             self.pos.db.add_products([carry_bag_product_list[i]]);
                        }
                       
                    }
                    self.pos_widget.screen_selector.show_popup('select-product');
                   
                    $('#customer-cance').click(function(){
                    self.pos_widget.screen_selector.set_current_screen('products');
                    });
                
                    }
                }
                else
                {
                    self.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Warning !!!!"),
                            'comment': _t("You have not choosen any Category for Carry Bag. Please choose some category in corresponding POS Session" ),
                        });
                }

            });
        },
    });

module.CarryBagListWidget = module.PosBaseWidget.extend({
        template: 'CarryBagListWidget',

        init: function(parent, options) {
            this._super(parent,options);
            this.model = options.model;

        },
        renderElement: function() {
            this._super();
            var self = this;
            $("a", this.$el).click(function(e){
                
               
                var product = self.pos.db.get_product_by_id(self.model.id);
                console.log(product);
                if(product)
                {
                self.pos.get('selectedOrder').addProduct(product,{price:product.list_price});
                self.pos_widget.screen_selector.set_current_screen('products');
                }
                else
                {
                    self.pos_widget.screen_selector.show_popup('error',{
                            'message': _t("Error"),
                            'comment': _t("Sorry there is no product" ),
                        });
                }
            });
        },

        get_product_image_url: function(product_id){
            return window.location.origin + '/web/binary/image?model=product.product&field=image_medium&id='+product_id;
        },
        get_product_price: function(product_id){
            var product = this.pos.db.get_product_by_id(product_id);
            return (product ? product.price : 0) || 0;
        },
       
        get_product_name: function(product_id){
           
            var product = this.pos.db.get_product_by_id(product_id);
            return (product ? product.display_name : undefined) || 'Unnamed Product';
        },

        
    });
 
module.CarryBagListScreenWidget = module.ScreenWidget.extend({
        template:'CarryBagListScreenWidget',

        init: function(parent, options) {
            this._super(parent,options);
            this.carry_bag_list = [];
        },

        start: function() {
            this._super();
            var self = this;
        },


        renderElement: function() {
            this._super();
            var self = this;

            this.carry_bag_list = [];
            var carry_bags = this.pos.get('carry_bag_product_list') || [];
            for(var i = 0;i < carry_bags.length;  i++ ){
                var carry_bag = new module.CarryBagListWidget(this, {
                    model: carry_bags[i],
                });
               
                carry_bag.appendTo(this.$('.carry_bag_list'));
            }

           
        },

        
    }),

module.ProductPopupWidget = module.PopUpWidget.extend({
        template:'ProductPopupWidget',
        
        start: function(){
            this._super();
            var self = this;
           this.carry_bag_list_widget = new module.CarryBagListScreenWidget(this,{});
        },

        show: function(){
            this._super();
            var self = this; 
            this.carry_bag_list_widget.replace($('.placeholder-CarryBagListScreenWidget'));       
        },
    });



module.PosWidget = module.PosWidget.extend({
        build_widgets: function(){
            this._super();
            var self = this;
            

            this.product_popup = new module.ProductPopupWidget(this, {});
            this.product_popup.appendTo(this.$el);
            this.product_popup.hide();
            this.screen_selector.popup_set['select-product'] = this.product_popup;   

            
        },
    });



var PosModelSuper = module.PosModel
    module.PosModel = module.PosModel.extend({
    load_server_data: function(){
        var self = this;
        var loaded = PosModelSuper.prototype.load_server_data.call(this);
        
        loaded = loaded.then(function(){
                    if(self.config.product_category)
                    {
                        return self.fetch(
                                'product.product',
                                ['display_name','list_price','price','pos_categ_id', 'taxes_id', 'ean13', 'default_code', 
                     'to_weight', 'uom_id', 'uos_id', 'uos_coeff', 'mes_type', 'description_sale', 'description',
                     'product_tmpl_id'],
                                [['pos_categ_id', '=',self.config.product_category[0]]])
                        .then(function(product){
                            
                            self.set({'carry_bag_product_list' : product,'return_bag_category_name':self.config.product_category[1]});
                            

                        });
                    }
                    else{
                        self.set({'carry_bag_product_list' :[]});
                    }
                });
        return loaded;
        },
    });



  

   
    
}
