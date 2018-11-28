openerp.pos_coupons = function(instance) {
    var module = instance.point_of_sale;
    pos_coupons_models(instance, module);
    pos_coupons_widget(instance, module);
};
