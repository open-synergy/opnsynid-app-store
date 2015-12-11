// function openerp_pos_screens(instance, module){ //module is instance.point_of_sale
//     var QWeb = instance.web.qweb,
    

//     var round_pr = instance.web.round_precision
//     module.PaymentScreenWidget = module.ScreenWidget.extend({
//         template: 'PaymentScreenWidget',
//         back_screen: 'products',
//         next_screen: 'receipt',
//         init: function(parent, options) {
           
//             this.pos.bind('change:selectedOrder',function(){
//                     alert("Hello");
//                 },this);

//             this.bind_events();
//          })
// });