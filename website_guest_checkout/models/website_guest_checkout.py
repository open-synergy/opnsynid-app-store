# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################

from openerp import fields ,models,api
from openerp.tools.translate import _
import urlparse
import werkzeug
from openerp import SUPERUSER_ID
import logging
_logger = logging.getLogger(__name__)

class product_template(models.Model):
	_inherit = 'website'	

	def get_uid(self, cr, uid, ids):		
		if uid:
			return uid
	def get_public_user_id(self, cr, uid, ids):		
		ir_model_data = self.pool.get('ir.model.data')
		p_user_id = ir_model_data.get_object_reference(cr, uid, 'base', 'public_user')[1]
		return p_user_id

	
			

	


