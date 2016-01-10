from openerp.osv import fields, osv
from openerp import SUPERUSER_ID
import logging
_logger = logging.getLogger(__name__)

	
###############################INHERIT CONFIG MODEL##########################################

class pos_config(osv.osv):
	_inherit = 'pos.config'
	
	_columns={
		'wk_display_stock': fields.boolean('Display stock in POS'),
		'wk_stock_type':fields.selection((('available_qty','Available Quantity(On hand)'),('forcated_qty','Forecasted Quantity'),('vartual_qty','Quantity on Hand - Outgoing Qty')),'Stock Type'),
		'wk_continous_sale':fields.boolean('Allow negative stock'),
		'wk_deny_val': fields.integer('Deny order when product qty is lower than '),
		'wk_error_msg':fields.char('Error message')

	}
	_defaults = {
		'wk_deny_val': 0,
		'wk_stock_type':'available_qty',
		'wk_error_msg':''
	}


	def wk_pos_fetch_pos_stock(self, cr, uid, kwargs):
		context = {}
		result = {}
		assert kwargs.has_key('pos_config_id') != False ,'POS CONFIG KEY ERROR !!!'
		assert kwargs['pos_config_id'] != False ,'No POS Configuration id found !!!'
		wk_config=self.read(cr, uid,kwargs['pos_config_id'], ['stock_location_id','wk_stock_type'], context=context)
		context['location'] = wk_config['stock_location_id'][0]
		wk_stock_type= wk_config['wk_stock_type']
		pos_products = self.pool.get('product.product').search(cr, uid,[('sale_ok','=',True),('available_in_pos','=',True)])
		pos_products_qtys = self.pool.get('product.product')._product_available(cr, SUPERUSER_ID, pos_products,None,False,context)
		for pos_product in pos_products_qtys:
			if wk_stock_type == 'available_qty':
				result[pos_product] = pos_products_qtys[pos_product]['qty_available']
			elif wk_stock_type == 'forcated_qty':
				result[pos_product] = pos_products_qtys[pos_product]['virtual_available']
			else:
				result[pos_product] = pos_products_qtys[pos_product]['qty_available'] - pos_products_qtys[pos_product]['outgoing_qty']
		return result
		
	