# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
##############################################################################

import logging

import openerp

from openerp import tools
from openerp.osv import fields, osv
from openerp.tools.translate import _

class pos_order_discount(osv.osv):
    _name = 'pos.order.discount' 

    def _discount_method_fun(self, cr, uid, ids,name,arg,context = None):
        res={}
        temp=0
        for discount_obj in self.browse(cr, uid, ids, context):
            if discount_obj.discount_method:
                res[discount_obj.id]=str(discount_obj.discount_method)+" ("+str(dict(self._columns['discount_type'].selection).get(discount_obj.discount_type))+")"
            else:
                res[discount_obj.id]=""
        return res

    _columns = {
    	'file': fields.binary('File'),
        'name': fields.char('Discount Name', help='Name of discount.',required=True,),
        'discount_method':fields.float('Discount basis',required=True),
        'discount_type':fields.selection([
					('percent','%'),
					('amount','Amount'),
					],"Discount type",required=True,),
        'short_description':fields.char("Short summary",help="To be displayed on POS."),
        'description':fields.text("Description"),
        'discount_on':fields.selection([                   
                    ('without_tax','Tax Exclusive'),
                    ('tax_inclusive','Tax Inclusive'),
                    ],"Discount Applied on",required=True,),
        'discount_method_function':fields.function(_discount_method_fun, string='Discount basis',type='char'),

    }
    _defaults = {
        'discount_type': 'percent',
        'discount_on':'without_tax',
    }

class pos_config(osv.osv):
    _inherit = 'pos.config' 
    _columns = {
        'wk_discount_product_id': fields.many2one('product.product','Discount Product',domain=[('type', '=','service')],help='The product used to model the discount'),
		'wk_discounts':fields.many2many('pos.order.discount','confing_discount_rel','wk_confing_id','wk_discount_id','Discounts'),
    	
    }

class pos_order(osv.osv):
    _inherit = "pos.order"
   
    def _order_fields(self, cr, uid, ui_order, context=None):
        res = super(pos_order, self)._order_fields(cr, uid, ui_order, context=context)
        list_test=[]
        if ui_order.has_key('discountLine'):
            list_test.extend(list(ui_order['discountLine']))
            list_test.extend(res['lines'])
            res['lines']=list_test
        return res
    



