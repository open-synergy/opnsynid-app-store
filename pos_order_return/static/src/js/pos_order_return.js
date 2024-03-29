/* Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>) */
/* See LICENSE file for full copyright and licensing details. */
/* License URL : <https://store.webkul.com/license.html/> */
openerp.pos_order_return = function(instance, module) {
    module = instance.point_of_sale;
    var QWeb = instance.web.qweb;
    _t = instance.web._t;
    var round_di = instance.web.round_decimals;
    var round_pr = instance.web.round_precision
    var SuperPosModel = module.PosModel.prototype;
    var SuperOrderListScreenWidget = module.OrderListScreenWidget.prototype;
    var SuperNumpadWidget = module.NumpadWidget.prototype;
    var SuperOrder = module.Order;
    var SuperOrderline =  module.Orderline.prototype;

    var models = SuperPosModel.models;
    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        if (model.model === 'product.product') {
            model.fields.push('not_returnable');
        }
    }

    module.MyMessagePopup = module.PopUpWidget.extend({
        template: 'MyMessagePopup',
        events: {
            'click .button.cancel':'click_cancel'
        },

        click_cancel:function(){
            this.pos.pos_widget.screen_selector.close_popup();
        },

        show: function(options){
            var self = this;
            this._super();
            this.body = options.body;
            this.title = options.title;
            this.renderElement();
        }
    });

    var OrderReturnPopup = module.PopUpWidget.extend({
        template: 'OrderReturnPopup',
        events: {
            'click .button.cancel':  'click_cancel',
            'click #complete_return':  'click_complete_return',
            'click #return_order':  'click_return_order',
        },

        click_cancel: function(){
            this.pos.pos_widget.screen_selector.close_popup();
        },

        click_return_order: function(){
            var self = this;
            var all = $('.return_qty');
            var return_dict = {};
            var return_entries_ok = true;
            $.each(all, function(index, value){
                var input_element = $(value).find('input');
                var line_quantity_remaining = parseFloat(input_element.attr('line-qty-remaining'));
                var line_id = parseFloat(input_element.attr('line-id'));
                var qty_input = parseFloat(input_element.val());
                if(!$.isNumeric(qty_input) || qty_input > line_quantity_remaining || qty_input < 0){
                    return_entries_ok = false;
                    input_element.css("background-color","#ff8888;");
                    setTimeout(function(){
                        input_element.css("background-color","");
                    },100);
                    setTimeout(function(){
                        input_element.css("background-color","#ff8888;");
                    },200);
                    setTimeout(function(){
                        input_element.css("background-color","");
                    },300);
                    setTimeout(function(){
                        input_element.css("background-color","#ff8888;");
                    },400);
                    setTimeout(function(){
                        input_element.css("background-color","");
                    },500);
                }

                if(qty_input == 0 && line_quantity_remaining != 0 && !self.options.is_partial_return)
                    self.options.is_partial_return = true;
                else if(qty_input > 0){
                    return_dict[line_id] = qty_input;
                    if(line_quantity_remaining != qty_input  && !self.options.is_partial_return)
                        self.options.is_partial_return = true;
                    else if(!self.options.is_partial_return)
                        self.options.is_partial_return = false;
                }
            });
            if(return_entries_ok)
                self.create_return_order(return_dict);
        },
        create_return_order: function(return_dict){
            var self = this;
            var order = self.options.order;
            var orderlines = self.options.orderlines;
            var current_order = self.pos.get_order(); 
            if(Object.keys(return_dict).length > 0){
                self.pos.add_new_order()
                var refund_order = self.pos.get_order();
                refund_order.set_client(self.pos.db.get_partner_by_id(order.partner_id[0]));
                refund_order.is_return_order = true;
                Object.keys(return_dict).forEach(function(line_id){
                    var line = self.pos.db.line_by_id[line_id];
                    var product = self.pos.db.get_product_by_id(line.product_id[0]);
                    refund_order.addProduct(product,{quantity:parseFloat(return_dict[line_id]), price:line.price_unit,discount:line.discount});
                    refund_order.selected_orderline.original_line_id = line.id;
                });
                if(self.options.is_partial_return){
                    refund_order.return_status = 'Partially-Returned';
                    refund_order.return_order_id = order.id;
                }
                else{
                    refund_order.return_status = 'Fully-Returned';
                    refund_order.return_order_id = order.id;
                }
                self.pos_widget.screen_selector.set_current_screen('payment');
                $("#cancel_refund_order").show();
            }
            else{
                self.$("input").css("background-color","#ff8888;");
                setTimeout(function(){
                    self.$("input").css("background-color","");
                },100);
                setTimeout(function(){
                    self.$("input").css("background-color","#ff8888;");
                },200);
                setTimeout(function(){
                    self.$("input").css("background-color","");
                },300);
                setTimeout(function(){
                    self.$("input").css("background-color","#ff8888;");
                },400);
                setTimeout(function(){
                    self.$("input").css("background-color","");
                },500);
            }
        },
        click_complete_return: function(){
            var self = this;
            var all = $('.return_qty');
            $.each(all, function(index, value){
                var line_quantity_remaining = parseFloat($(value).find('input').attr('line-qty-remaining'));
                $(value).find('input').val(line_quantity_remaining);
            });
        },
        show: function(options){
            options = options || {};
            var self = this;
            self.options = options;
            this._super(options);
            this.orderlines = options.orderlines    || [];
            this.renderElement();
        },
    });

    module.PosModel = module.PosModel.extend({
        initialize: function(session, attributes) {
            SuperPosModel.initialize.call(this,session,attributes);
            var self = this;
            self.models.push(
            {
                model:  'pos.order',
                fields: ['id', 'name', 'date_order', 'partner_id', 'lines', 'pos_reference','invoice_id','is_return_order','return_order_id','return_status','statement_ids','amount_total'],
                domain: function(self) {
                    var domain_list = [];
                    if(self.config.order_loading_options == 'n_days'){
                        var today = new Date();
                        var validation_date = new Date(today.setDate(today.getDate()-self.config.number_of_days)).toISOString();
                        domain_list = [['date_order','>',validation_date],['state', 'not in', ['draft', 'cancel']],['is_return_order','=',false]];
                    }
                    else if(self.config.order_loading_options == 'current_session')
                        domain_list = [['session_id', '=', self.pos_session.name], ['state', 'not in', ['draft', 'cancel']],['is_return_order','=',false]];
                    else
                        domain_list = [['state', 'not in', ['draft', 'cancel']],['is_return_order','=',false]];
                    return domain_list;
                },
                loaded: function(self, wk_order) {
                    self.db.pos_all_orders = wk_order;
                    self.db.order_by_id = {};
                    wk_order.forEach(function(order){
                        var order_date = new Date(order['date_order'])
                        var utc = order_date.getTime() - (order_date.getTimezoneOffset() * 60000);
                        order['date_order'] = new Date(utc).toLocaleString()
                        self.db.order_by_id[order.id] = order;
                    });
                },
            },
            {
                model: 'pos.order.line',
                fields: ['product_id', 'order_id', 'qty','discount','price_unit','price_tax','price_subtotal_incl','price_subtotal','line_qty_returned'],
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

            },
            {
                model: 'account.bank.statement.line',
                fields: ['id','journal_id','amount'],
                loaded: function(self, statements) {
                    self.db.all_statements = statements;
                    self.db.statement_by_id = {};
                    statements.forEach(function(statement) {
                        self.db.statement_by_id[statement.id] = statement;
                    });
                },
            });
        },
        
    });

    module.OrderWidget.include({
        update_summary: function(){
            this._super();
            var order = this.pos.get_order();
            if (!order.get('orderLines').length) {
                return;
            }
            var total    = order ? order.getTotalTaxIncluded() : 0;
            var taxes    = order ? total - order.getTotalTaxExcluded() : 0;
            if(order.is_return_order){
                total *= -1;
                taxes *= -1;
            }
            this.el.querySelector('.summary .total > .value').textContent = this.format_currency(total);
            this.el.querySelector('.summary .total .subentry .value').textContent = this.format_currency(taxes);
        },
    });

    module.ClientListScreenWidget.include({
        show: function(){
            var self = this;
            self._super();
            if(self.pos.get_order().is_return_order){
                this.pos_widget.screen_selector.back();
            }
        }
    });

    var SuperPaymentline = module.Paymentline.prototype
    module.Paymentline = module.Paymentline.extend({
        set_amount: function(value){
            var self = this;
            var order = self.pos.get_order();
            SuperPaymentline.set_amount.call(this,value)
            var change = order.getChange();
            if(order.is_return_order && change>0){
                var amount = (value - change);
                this.amount = round_di(parseFloat(amount) || 0, this.pos.currency.decimals);
                $('.paymentline.selected input' ).val(this.amount)
                this.pos.pos_widget.order_widget.numpad_state.attributes.buffer = this.amount.toString();
                this.trigger('change:amount',this);
            }
        },
    });

    module.ProductScreenWidget.include({
        show: function(){
            var self = this;
            var current_order = self.pos.get_order();
            $("#cancel_refund_order").on("click", function(){
                $(".deleteorder-button").trigger("click");
            });
            this._super();
            if(self.pos.get_order().is_return_order){
                $('.product').css("pointer-events","none");
                $('.product').css("opacity","0.4");
                $('#refund_order_notify').show();
                $('#cancel_refund_order').show();
                self.$('.numpad-backspace').css("pointer-events","none");
            }
            else{
                $('.product').css("pointer-events","");
                $('.product').css("opacity","");
                $('#refund_order_notify').hide();
                $('#cancel_refund_order').hide();
                self.$('.numpad-backspace').css("pointer-events","");
            }
        }
    });

    module.Orderline = module.Orderline.extend({
        initialize: function(attr,options){
            var self = this;
            this.line_qty_returned = 0;
            this.original_line_id = null;
            SuperOrderline.initialize.call(this,attr,options);
        },
        export_as_JSON: function() {
            var self = this;
            var loaded=SuperOrderline.export_as_JSON.call(this);
            loaded.line_qty_returned=self.line_qty_returned;
            loaded.original_line_id=self.original_line_id;
            return loaded;
        }
    });

    module.Order = module.Order.extend({
        initialize: function(attributes,options){
            var self = this;
            self.return_status = '-';
            self.is_return_order = false;
            self.return_order_id = false;
            SuperOrder.prototype.initialize.call(this,attributes,options);
        },
        export_as_JSON: function() {
            var self = this;
            var loaded=SuperOrder.prototype.export_as_JSON.call(this);
            var current_order = self.pos.get_order();
            if(self.pos.get_order()!=null)
            {   
                loaded.is_return_order = current_order.is_return_order;
                loaded.return_status = current_order.return_status;
                loaded.return_order_id = current_order.return_order_id;
            }
            return loaded;
        },
    });

    module.NumpadWidget.include({
        clickAppendNewChar: function(event) {
            var self = this;
            if(!(self.pos.get_order().is_return_order && self.pos.get('selectedOrder').get_screen_data('screen') == 'products')){
                this._super(event);
            }
        },
        clickSwitchSign: function() {
            var self = this;
            if(!self.pos.get_order().is_return_order)
                this._super(); 
        },
    });

    module.OrderButtonWidget = module.OrderButtonWidget.extend({
        selectOrder: function(event){
            this._super(event);
            if(!this.order.is_return_order){
                $("#cancel_refund_order").hide();
            }
            else{
                $("#cancel_refund_order").show();
            }
        },
    });

    module.OrderListScreenWidget = module.OrderListScreenWidget.extend({
        line_select: function(event, $line, id) {
            var self = this;
            var order = self.pos.db.order_by_id[id];
            this.$('.wk_order_list .lowlight').removeClass('lowlight');
            if ($line.hasClass('highlight')) {
                $line.removeClass('highlight');
                $line.addClass('lowlight');
                this.display_order_details('hide', order);
            } else {
                this.$('.wk_order_list .highlight').removeClass('highlight');
                $line.addClass('highlight');
                self.selected_tr_element = $line;
                var y = event.pageY - $line.parent().offset().top;
                self.display_order_details('show', order, y);
            }
        },
        display_order_details: function(visibility, order, clickpos) {
            var self = this;
            var contents = this.$('.order-details-contents');
            var parent = this.$('.wk_order_list').parent();
            var scroll = parent.scrollTop();
            var height = contents.height();
            var orderlines = [];
            var statements = [];
            var journal_ids_used = [];
            if (visibility === 'show') {
                order.lines.forEach(function(line_id) {
                    orderlines.push(self.pos.db.line_by_id[line_id]);
                });
                order.statement_ids.forEach(function(statement_id) {
                    var statement = self.pos.db.statement_by_id[statement_id];
                    statements.push(statement);
                    journal_ids_used.push(statement.journal_id[0]);
                });

                contents.empty();
                contents.append($(QWeb.render('OrderDetails', { widget: self, order: order, orderlines: orderlines, statements: statements })));
            
                var new_height = contents.height();
                if (!this.details_visible) {
                    if (clickpos < scroll + new_height + 20) {
                        parent.scrollTop(clickpos - 20);
                    } else {
                        parent.scrollTop(parent.scrollTop() + new_height);
                    }
                } else {
                    parent.scrollTop(parent.scrollTop() - height + new_height);
                }
                this.details_visible = true;
                self.$("#close_order_details").on("click", function() {
                    self.selected_tr_element.removeClass('highlight');
                    self.selected_tr_element.addClass('lowlight');
                    self.details_visible = false;
                    self.display_order_details('hide', null);
                });
                self.$("#wk_refund").on("click", function() {
                    var order_list = self.pos.db.pos_all_orders;
                    var order_line_data = self.pos.db.pos_all_order_lines;
                    var order_id = this.id;
                    var message = '';
                    var non_returnable_products = false;
                    var original_orderlines = [];
                    var allow_return = true;
                    if(order.return_status == 'Fully-Returned'){
                        message = 'Sorry, You can`t return same order twice !!'
                        allow_return = false;
                    }
                    if (allow_return) {
                        order.lines.forEach(function(line_id){
                            var line = self.pos.db.line_by_id[line_id];
                            var product = self.pos.db.get_product_by_id(line.product_id[0]);
                            if (product.not_returnable) {
                                non_returnable_products = true;
                                message = 'This order contains some Non-Returnable products, do you wish to return other products?'
                            }
                            
                            else if(line.qty - line.line_qty_returned > 0){
                                original_orderlines.push(line);
                            }
                        });
                        if(original_orderlines.length == 0){
                            self.pos_widget.screen_selector.show_popup('my_message',{
                                title: _t('Cannot Return This Order!!!'),
                                body: _t("There are no returnable products left for this order!"),
                            });
                        }
                        else if(non_returnable_products){
                            self.pos_widget.screen_selector.show_popup('confirm',{
                                'title': _t('Warning !!!'),
                                'body': _t(message),
                                confirm: function(){
                                    self.pos_widget.screen_selector.show_popup('return_products_popup',{
                                        'orderlines': original_orderlines,
                                        'order':order,
                                        'is_partial_return':true,
                                    });
                                },
                            });
                        }
                        else{
                            self.pos_widget.screen_selector.show_popup('return_products_popup',{
                                'orderlines': original_orderlines,
                                'order':order,
                                'is_partial_return':false,
                            });
                        }
                    }
                    else
                    {
                        self.pos_widget.screen_selector.show_popup('my_message',{
                            'title': _t('Error!!!'),
                            'body': _t(message),
                        });
                    }
                });
            }
            if (visibility === 'hide') {
                contents.empty();
                if (height > scroll) {
                    contents.css({ height: height + 'px' });
                    contents.animate({ height: 0 }, 400, function() {
                        contents.css({ height: '' });
                    });
                } else {
                    parent.scrollTop(parent.scrollTop() - height);
                }
                this.details_visible = false;
            }
        },
        show: function(){
            var self = this;
            SuperOrderListScreenWidget.show.call(this);
            var order = self.pos.get_order();
            if(!order.is_return_order){
                $("#cancel_refund_order").hide();

            }
            else{
                $("#cancel_refund_order").show();
            }
            var self = this;
            this.details_visible = false;
            this.selected_tr_element = null;
            self.$('.order-list-contents').delegate('.order-line', 'click', function(event) {
                event.stopImmediatePropagation();
                self.line_select(event, $(this), parseInt($(this).data('id')));
            });
            var contents = this.$('.order-details-contents');
            contents.empty();
            var parent = self.$('.wk_order_list').parent();
            parent.scrollTop(0);
        },
    });

    module.PosWidget = module.PosWidget.extend({
        build_widgets: function() {
            this._super();
            var self = this;
            this.return_products_popup = new OrderReturnPopup(this, {});
            this.return_products_popup.appendTo(this.$el);
            this.return_products_popup.hide();
            this.screen_selector.popup_set['return_products_popup'] = this.return_products_popup;
            this.my_message = new module.MyMessagePopup(self, {});
            this.my_message.appendTo(this.$el);
            this.my_message.hide();
            this.screen_selector.popup_set['my_message'] = this.my_message;
        },
    });
}