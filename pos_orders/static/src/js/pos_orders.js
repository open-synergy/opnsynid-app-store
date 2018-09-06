/* Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>) */
/* See LICENSE file for full copyright and licensing details. */
/* License URL : <https://store.webkul.com/license.html/> */
openerp.pos_orders = function(instance, module) {
	var module   = instance.point_of_sale;
	var SuperPosWidget = module.PosWidget.prototype;
    var SuperPosModel = module.PosModel;
    var SuperPaymentScreenWidget = module.PaymentScreenWidget.prototype;
    var QWeb = instance.web.qweb;

    module.PosModel = module.PosModel.extend({
        initialize: function(session, attributes) {
            var rr = SuperPosModel.prototype.initialize.call(this,session,attributes);
            var self = this;
            self.models.push(
            {
                model:  'pos.order',
                fields: ['id', 'name', 'date_order', 'partner_id', 'lines', 'pos_reference'],
                domain: function(self){ 
                    var domain_list = [];
                    if(self.config.order_loading_options == 'n_days'){
                        var today = new Date();
                        var validation_date = new Date(today.setDate(today.getDate()-self.config.number_of_days)).toISOString();
                        domain_list = [['date_order','>',validation_date],['state', 'not in', ['draft', 'cancel']]];
                    }
                    else if(self.config.order_loading_options == 'current_session')
                        domain_list = [['session_id', '=', self.pos_session.name], ['state', 'not in', ['draft', 'cancel']]];
                    else
                        domain_list = [['state', 'not in', ['draft', 'cancel']]];
                    return domain_list;
                },
                loaded: function(self, orders){ 
                    self.db.pos_all_orders = orders;
                    self.db.order_by_id = {};
                    orders.forEach(function(order){
                        var order_date = new Date(order['date_order'])
                        var utc = order_date.getTime() - (order_date.getTimezoneOffset() * 60000);
                        order['date_order'] = new Date(utc).toLocaleString()
                        self.db.order_by_id[order.id] = order;
                    });
                }
            },
            {
                model:  'pos.order.line',
                fields: ['create_date','discount','display_name','id','order_id','price_subtotal','price_subtotal_incl','price_unit','product_id','qty','write_date'],
                domain: function(self) {
                    var order_lines = []
                    var orders = self.db.pos_all_orders;
                    for (var i = 0; i < orders.length; i++) {
                        order_lines = order_lines.concat(orders[i]['lines']);
                    }
                    return [
                        ['id', 'in', order_lines]
                    ];
                },
                loaded: function(self, wk_order_lines) {
                    self.db.pos_all_order_lines = wk_order_lines;
                    self.db.line_by_id = {};
                    wk_order_lines.forEach(function(line){
                    self.db.line_by_id[line.id] = line;
                });
                },
            });
        },

        push_and_invoice_order: function(order){
            var self = this;
            var invoiced = new $.Deferred(); 

            if(!order.get_client()){
                invoiced.reject('error-no-client');
                return invoiced;
            }

            var order_id = this.db.add_order(order.export_as_JSON());

            this.flush_mutex.exec(function(){
                var done = new $.Deferred(); // holds the mutex
                var transfer = self._flush_orders([self.db.get_order(order_id)], {timeout:30000, to_invoice:true});   
                transfer.fail(function(){
                    invoiced.reject('error-transfer');
                    done.reject();
                });
                transfer.pipe(function(order_server_id){    
                    self.pos_widget.do_action('point_of_sale.pos_invoice_report',{additional_context:{ 
                        //Code chenged for POS All Orders List --START--
                        active_ids:[order_server_id.orders[0].id],
                        //Code chenged for POS All Orders List --END--
                    }});

                    invoiced.resolve();
                    done.resolve();
                });
                return done;
            });
            return invoiced;
        },

        _save_to_server: function (orders, options) {
            var self = this;
            return SuperPosModel.prototype._save_to_server.call(this,orders,options).then(function(return_dict){
                if(return_dict.orders != null){
                    return_dict.orders.forEach(function(order){
                        if(order.existing)
                        {
                            self.db.pos_all_orders.forEach(function(order_from_list){
                                if(order_from_list.id == order.original_order_id)
                                    order_from_list.return_status = order.return_status
                            });
                        }
                        else{
                            var order_date = new Date(order['date_order'])
							var utc = order_date.getTime() - (order_date.getTimezoneOffset() * 60000);
							order['date_order'] = new Date(utc).toLocaleString()
							self.db.order_by_id[order.id] = order;
                            self.db.pos_all_orders.unshift(order);
                            self.db.order_by_id[order.id] = order;
                        }
                    });
                    return_dict.orderlines.forEach(function(orderline){
                        if(orderline.existing){
                            var target_line = self.db.line_by_id[orderline.id];
                            target_line.line_qty_returned = orderline.line_qty_returned;
                        }
                        else{
                            self.db.pos_all_order_lines.unshift(orderline);
                            self.db.line_by_id[orderline.id] = orderline;
                        }
                    });
                    if(self.db.all_statements)
                        return_dict.statements.forEach(function(statement) {
                            self.db.all_statements.unshift(statement);
                            self.db.statement_by_id[statement.id] = statement;
                    });
                
                }
                return return_dict;
            })
            .fail(function (error, event){
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

	module.PosWidget = module.PosWidget.extend({
		start: function() {
			var self = this;
			SuperPosWidget.start.call(this);
			return self.pos.ready.done(function() {
				self.$('#view_all_orders').click(function(){
                    self.pos_widget.screen_selector.set_current_screen('wkorderlist',{'customer_id': undefined});
				});
			});
		}
	});

    module.OrderListScreenWidget = module.ScreenWidget.extend({
        template: 'OrderListScreenWidget',
        show_leftpane: false,
        previous_screen: 'products',

        get_customer: function() {
            var ss = this.pos_widget.screen_selector;
            if (ss) {
                return ss.get_current_screen_param('customer_id');
            } else {
                return undefined;
            }
        },

        display_order: function(intput_txt) {
            var self = this;
            customer_id = this.get_customer();
            var order_list = self.pos.db.pos_all_orders;
            if (customer_id != undefined) {
                var new_order_data = [];
                for (i = 0; i < order_list.length; i++) {
                    if (order_list[i].partner_id[0] == customer_id) {
                        new_order_data = new_order_data.concat(order_list[i]);
                    }
                }
                order_list = new_order_data;
            }
            if (intput_txt != undefined && intput_txt != '') {
                var new_order_data = [];
                var search_text = intput_txt.toLowerCase()
                for (i = 0; i < order_list.length; i++) {

                    if (order_list[i].partner_id == '') {
                        order_list[i].partner_id = [0, '-'];
                    }
                    if (((order_list[i].name.toLowerCase()).indexOf(search_text) != -1) || ((order_list[i].partner_id[1].toLowerCase()).indexOf(search_text) != -1)) {
                        new_order_data = new_order_data.concat(order_list[i]);
                    }
                }
                order_list = new_order_data;
            }
            var contents = this.$el[0].querySelector('.order-list-contents');
            contents.innerHTML = "";
            order_list.forEach(function(order){
                var orderline_html = QWeb.render('WkOrderLine', {
                    widget: this,
                    order_list: order
                });
                var orderline = document.createElement('tbody');
                orderline.innerHTML = orderline_html;
                orderline = orderline.childNodes[1];
                contents.appendChild(orderline);
            });
        },

        show: function() {
            var self = this;
            this._super();
            this.display_order(undefined);
            this.$('.order_search').keyup(function() {
                self.display_order(this.value);
            });
            this.$('.back').click(function() {
                self.pos_widget.screen_selector.set_current_screen(self.previous_screen);
            });
        },
    });

    module.PosWidget = module.PosWidget.extend({
        build_widgets: function() {
            var self = this;
            this._super();
            this.orderList_screen = new module.OrderListScreenWidget(this, {});
            this.orderList_screen.appendTo(this.$('.pos-content'));
            this.screen_selector.add_screen('wkorderlist', this.orderList_screen);
        }
    });

    module.ClientListScreenWidget.include({
        template: 'ClientListScreenWidget',
        show: function() {
            var self = this;
            self._super();
            self.$('.client-list-contents').delegate('.view_all_order',"click", function() {
                self.pos_widget.screen_selector.set_current_screen('wkorderlist', {
                    'customer_id': this.id
                });
            });
        },
    });
}