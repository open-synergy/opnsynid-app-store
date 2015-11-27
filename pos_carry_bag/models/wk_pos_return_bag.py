from openerp.osv import fields, osv



class pos_config(osv.osv):
    _inherit = 'pos.config'
    _columns = {
         'product_category': fields.many2one('pos.category', 'Carry bag category')
        }

