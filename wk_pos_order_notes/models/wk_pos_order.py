from openerp.osv import fields, osv

class pos_order(osv.osv):
    _inherit = "pos.order"

    def _order_fields(self, cr, uid, ui_order, context=None):
        fields_return=super(pos_order,self)._order_fields(cr, uid, ui_order,context=context)
        fields_return.update({'note':ui_order.get('order_note','')})
        return fields_return
      


class pos_config(osv.osv):
    _inherit = 'pos.config'
    _columns = {
        'print_note' : fields.boolean('Print note along with receipt'),
        }

