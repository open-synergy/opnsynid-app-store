function wk_openerp_pos_order_note(instance, module){

var OrderSuper = module.Order;
// module.PaymentScreenWidget.unset(validate_order);

module.Order = module.Order.extend({
	
		get_order_note: function(){
            return $("#wk_note_id").val();
        },
       export_as_JSON: function() {
            var self = this;
            var loaded=OrderSuper.prototype.export_as_JSON.call(this);
            // console.log(loaded);
            loaded.order_note=self.get_order_note();  
            console.log(loaded); 
        return loaded;
        },
    
        
});
    
}
