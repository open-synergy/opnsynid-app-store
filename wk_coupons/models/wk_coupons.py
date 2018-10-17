# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################

from openerp import api, fields, models, _
from openerp import tools
from openerp.osv import  osv
from datetime import datetime, timedelta, date
import logging
import string
import random
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
_logger = logging.getLogger(__name__)


def _code_generator(size=8, chars=string.ascii_uppercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))
	

class VoucherVoucher(models.Model):
	_name = "voucher.voucher"
	_order = 'create_date desc'
	_inherit = ['mail.thread', 'ir.needaction_mixin']
	_description = 'Vouchers'

	@api.model
	def _get_default_values_conf(self):
		default_values = self.env['voucher.config']._get_default_values()
		return default_values

	@api.model
	def _get_default_expiry_date(self):
		result = self._get_default_values_conf()
		return result['max_expiry_date']

	@api.model
	def _get_default_validity(self):
		result = self._get_default_values_conf()
		return result['default_validity']

	@api.model
	def _get_default_voucher_value(self):
		result = self._get_default_values_conf()
		return result['default_value']

	@api.model
	def _get_default_total_available(self):
		result = self._get_default_values_conf()
		return result['default_availability']


	@api.model
	def _get_default_partital_use(self):
		result = self._get_default_values_conf()
		return result['partially_use']

	@api.model
	def _get_default_use_cart_limit(self):
		result = self._get_default_values_conf()
		return result['use_minumum_cart_value']
	@api.model
	def _get_default_cart_limit_value(self):
		result = self._get_default_values_conf()
		return result['minimum_cart_amount']

	@api.model
	def _get_default_voucher_usage(self):
		result = self._get_default_values_conf()
		return result['voucher_usage']

	@api.model
	def _get_default_customer_type(self):
		result = self._get_default_values_conf()
		return result['customer_type']
		

	name = fields.Char('Name', size=100, required=True, help="This will be displayed in the order summary, as well as on the invoice.")
	voucher_code = fields.Char(string='Code', size=13, help="Secret 13 digit code use by customer to redeem this coupon.")
	create_date = fields.Datetime(string='Create Date', help="Date on which voucher is created.")
	issue_date = fields.Date(string='Applicable From', help="Date on which voucher is issued.",default=datetime.now().date())
	expiry_date = fields.Date(string='Expiry Date', help="Date on which voucher is expired.", default=_get_default_expiry_date)
	validity = fields.Integer(string='Validity(in days)',default=_get_default_validity, help="Validity of this Voucher in days( -1 for unlimited )")
	total_available = fields.Integer(string='Total Available',required=True,default=_get_default_total_available, help="The cart rule will be applied to the first 'X' customers only.(-1 for unlimited )")
	voucher_value = fields.Float(string='Voucher Value', required=True, default=_get_default_voucher_value)
	note = fields.Text('Description',help="This information will be dispayed to the customers oon front end")
	active = fields.Boolean(string='Active', help="By unchecking the active field you can disable this voucher without deleting it.",default=1)
	user_id = fields.Many2one(comodel_name='res.users', string='Created By')
	customer_id = fields.Many2one(comodel_name='res.partner', string='Created For', help='Optional: The cart rule will be available to everyone if you leave this field blank.')
	available_each_user = fields.Integer('Total available for each user', help="A customer will only be able to use the cart rule 'X' time(s).",default=-1)
	voucher_val_type  = fields.Selection([('percent', '%'),('amount', 'Fixed')],required=True, default="amount")
	date_of_last_usage =  fields.Date('Date of last usage', help="the dat of the last usage of the coupon.")
	voucher_usage = fields.Selection([('both', 'Both POS & Ecommerce'),('ecommerce', 'Ecommerce'),('pos', 'Point Of Sale')], required=True, default=_get_default_voucher_usage, string="Coupon Used In" ,help="Choose where you want to use the coupon pos/ecommerce and odoocore")
	voucher_value_left = fields.Float(compute="_get_total_voucher_value_remained", string="Total value left",help="the amount of the voucher left")
	customer_type = fields.Selection([('special_customer', 'Specific Customers'),('general', 'All Customers')], required=True, default=_get_default_customer_type, string="Coupon for" ,help="On choosing the General the coupon can be applied for all customers, and on choosing the Special Customer the Coupon can be used for a particlar customer and can be partially redeemed.If the customer type is choosen as new Customers the coupon will be appllied for new registered customers.")
	is_partially_redemed = fields.Boolean('Use Partial Redemption',default=_get_default_partital_use, help="Enable this option partial redemption option.")
	redeemption_limit = fields.Integer('Max Redemption Limit',required=True, default=-1, help="The maximum number of times the coupon can be redeemed. -1 means the coupon can be used any number of times untill the voucher value is Zero.")
	use_minumum_cart_value = fields.Boolean('Use Cart Amount Validation',default=_get_default_use_cart_limit, help="Use this option for using this voucher based on the cart amount.")
	minimum_cart_amount = fields.Float('Minimum Cart Amount', default=_get_default_cart_limit_value, help="Apply this coupon only if the cart value is greater than this amount.")
	applied_on = fields.Selection([('all','All Products'),('specific','Specific Products')], string='Voucher Applied on', default="all", required=True, help="Products on which the voucher is applied")
	product_ids = fields.Many2many('product.template', 'voucher_id', 'product_id', 'voucher_product_rel', string='Products', help="Add products on which this voucher will be valid")
	display_desc_in_web = fields.Boolean('Display Description in Website', default=True)
	_sql_constraints = [
		('voucher_code_uniq', 'unique(voucher_code)', 'Voucher Code Must Be Unique !!!'),
	]

	@api.model
	def get_create_user_values(self):
		config_obj = self.env['voucher.config'].search([], limit=1)
		if config_obj:
			company =  config_obj.create_uid.company_id.name
			curency =  config_obj.create_uid.company_id.currency_id.symbol
			return {'company':company,'curency':curency}
		return False
	
	@api.multi
	@api.depends('voucher_value','total_available')
	def _get_total_voucher_value_remained(self):
		for obj in self:
			amount_left = 0
			history_objs = self.env['voucher.history'].search([('voucher_id','=',obj.id)])
			if history_objs:
				for hist_obj in history_objs:
					if obj.customer_type == 'special_customer':
						amount_left += self._get_amout_left_special_customer(hist_obj)
					if obj.customer_type == 'general' and obj.total_available > 0: 
						amount_left = obj.total_available * obj.voucher_value
			obj.voucher_value_left = amount_left
	
	def _get_amout_left_special_customer(self, hist_obj):
		amount_left = 0
		credit = 0
		debit = 0
		if hist_obj.transaction_type == 'credit':
			credit +=  hist_obj.voucher_value
		if hist_obj.transaction_type == 'debit':
			debit += -hist_obj.voucher_value
		amount_left = credit - debit
		return amount_left


	@api.multi
	def send_mail_to_customers(self):
		if self.customer_type == 'special_customer':
			ir_model_data = self.env['ir.model.data']
			template_obj = self.env['mail.template']
			template_id =  ir_model_data.get_object_reference('wk_coupons','mail_template_voucher_voucher')[1]
			template_obj = self.env['mail.template'].browse(template_id)
			values = {}
			values['email_to'] = self.customer_id.email
			res = template_obj.send_mail(self.id, True ,'',values)
			if res:
				wizard_id = self.env['wizard.message'].create({'text':'Email has been sent successfully to the selected customer..'}).id
				return { 'name':_("Summary"),
						'view_mode': 'form',
						'view_id': False,
						'view_type': 'form',
						'res_model': 'wizard.message',
						'res_id': wizard_id,
						'type': 'ir.actions.act_window',
						'nodestroy': True,
						'target': 'new',
						'domain': '[]',
						}
		else:
			raise osv.except_osv(('Error!'), ("Mail can not be sent. No customer selected.."))

	@api.multi
	def unlink(self):
		for record in self:
			history_objs = record.env['voucher.history'].search([('voucher_id','=',record.id)])
			for obj in history_objs:
				obj.unlink()
		return super(VoucherVoucher, self).unlink()

	@api.model
	def create(self, vals):
		history_values = {}
		voucher_amount = 0
		default_values = self.env['voucher.config']._get_default_values()
		if vals['voucher_value'] < default_values['min_amount']:
			raise osv.except_osv(('Error!'), ('You can`t create voucher below this minimum amount (%s) !!!')%default_values['min_amount'])
		if vals['voucher_value'] > default_values['max_amount']:
			raise osv.except_osv(('Error!'), ('You can`t create voucher greater than this maximum amount (%s) !!!')%default_values['max_amount'])
		if vals['voucher_value'] < 0:
			raise osv.except_osv(('Error!'), ('Voucher Value cannot be negative'))
		vals['user_id']= self._uid
		if vals['voucher_code'] == False:
			vals['voucher_code'] = self._generate_code()
		else:
			vals['voucher_code'] = self._check_code(vals['voucher_code'])																												
		max_expiry_date = vals['expiry_date']
		if vals['validity'] > 0:
			exp_date = (datetime.strptime(vals['issue_date'],'%Y-%m-%d').date() + timedelta(days=vals['validity']))
			vals['expiry_date'] = exp_date
			if vals['expiry_date'] < datetime.strptime(str(max_expiry_date),'%Y-%m-%d').date():
				vals['expiry_date'] = max_expiry_date
		if datetime.now().date() > datetime.strptime(str(vals['expiry_date']),'%Y-%m-%d').date():
			raise osv.except_osv(('Error!'), ('Expiry date have been passed already. Please select a correct expiry date..'))
		if datetime.now().date() > datetime.strptime(str(vals['issue_date']),'%Y-%m-%d').date():
			raise osv.except_osv(('Error!'), ('Voucher Applicable date is not correct. Either you can make voucher applicable from today or from a future date.'))

		if vals['redeemption_limit'] and  vals['redeemption_limit'] == 0:
			raise osv.except_osv(('Error!'), ('You cannnot set Reedemption limit To 0'))

		if vals['customer_type'] == 'special_customer':
			voucher_amount += vals['voucher_value']
		res  = super(VoucherVoucher, self).create(vals)
		history_values = {
			'name':vals['name'],
			'create_date':datetime.now(),
			'voucher_value':voucher_amount,
			'transaction_type':'credit',
			'channel_used':vals['voucher_usage'],
			'voucher_id':res.id
			}
		self.env['voucher.history'].sudo().create(history_values)
		return res

	@api.multi
	def write(self, vals):
		for voucher in self:
			history_values = {}
			if vals.has_key('name'):
				history_values['name'] = vals['name']
			if vals.get('validity',False) or vals.get('issue_date',False):
				if not vals.get('issue_date',False):
					vals['issue_date'] = voucher.read(['issue_date'])[0]['issue_date']
				if not vals.get('validity',False):
					vals['validity'] = voucher.read(['validity'])[0]['validity']
				if not vals.get('expiry_date',False):
					max_expiry_date = voucher.read(['expiry_date'])[0]['expiry_date']
				else:
					max_expiry_date = vals['expiry_date']
				if vals['validity'] >0:
					exp_date = (datetime.strptime(vals['issue_date'],'%Y-%m-%d').date()+timedelta(days=vals['validity']))
					vals['expiry_date'] = exp_date
					if vals['expiry_date'] < datetime.strptime(str(max_expiry_date),'%Y-%m-%d').date():
						vals['expiry_date'] = max_expiry_date
			if vals.has_key('validity') and vals['validity'] == 0:
				raise osv.except_osv(('Error!'), ('Validiy can`t be 0. Choose -1 for unlimited or greater than 0 !!!'))
			default_values = voucher.env['voucher.config']._get_default_values()
			if vals.has_key('voucher_value') and vals['voucher_value'] < default_values['min_amount']:
				raise osv.except_osv(('Error!'), (('You can`t create voucher below this minimum amount (%s) !!!')%default_values['min_amount']))
			if  vals.has_key('voucher_value') and vals['voucher_value'] > default_values['max_amount']:
				raise osv.except_osv(('Error!'), (('You can`t create voucher below this minimum amount (%s) !!!')%default_values['min_amount']))
			if vals.has_key('redeemption_limit') and  vals['redeemption_limit'] == 0:
				raise osv.except_osv(('Error!'), ('You cannnot set Reedemption limit To 0'))
			if vals.has_key('voucher_code'):
				vals['voucher_code'] = voucher._check_write_code(vals['voucher_code'],self.ids)
			if vals.has_key('voucher_value'):
				history_values['voucher_value'] = vals['voucher_value']
			if vals.has_key('voucher_usage'):
				history_values['channel_used'] = str(vals['voucher_usage'])
			history_obj = self.env['voucher.history'].sudo().search([('voucher_id','=',self.id),('transaction_type','=','credit')])
			if history_obj:
				history_obj.sudo().write(history_values)
		return super(VoucherVoucher, self).write(vals)

	@api.multi
	def _generate_code(self):
		while True:
			code = _code_generator()
			check = self.search_count([('voucher_code','=',code),('active','in',[True,False])])
			if not check:
				break
		return code

	@api.multi
	def _check_code(self, code):
		exists = self.search_count([('voucher_code','=',code),('active','in',[True,False])])
		if exists:
			raise osv.except_osv(('Error!'), ("Coupon code already exist !!!"))
		return code

	@api.multi
	def _check_write_code(self, code, code_id):
		exists = self.search([('voucher_code','=',code),('active','in',[True,False])])
		if exists:
			if len(exists) == 1 and exists[0].id == code_id:
				return code
			else:
				raise osv.except_osv(('Error!'), ("Coupon code already exist !!!"))
		return code

	@api.multi
	def _get_voucher_obj_by_code(self, secret_code,refrence):
		self_obj = False
		if refrence and refrence == 'ecommerce':
			self_obj = self.search([('voucher_code','=',secret_code),('active','in',[True,False]),('voucher_usage','in', ['both','ecommerce'])])
		if refrence and refrence == 'pos':
			self_obj = self.search([('voucher_code','=',secret_code),('active','in',[True,False]),('voucher_usage','in', ['both','pos'])])
		return self_obj 

	@api.multi
	def _validate_n_get_value(self, secret_code, wk_order_total, product_ids, refrence=False, partner_id=False):
		result={}
		result['status']=False
		defaults = self.env['voucher.config']._get_default_values()
		self_obj = self._get_voucher_obj_by_code(secret_code, refrence)
		if not self_obj:
			result['type']		= _('ERROR')
			result['message']	= _('Voucher doesn`t exist !!!')
			return result
		if not self_obj.active:
			result['type']		= _('ERROR')
			result['message']	= _('Voucher has been de-avtivated !!!')
			return result
		amount_left = 0
		used_vouchers = 0
		voucher_value = self_obj.voucher_value
		total_prod_voucher_price = 0
		used_vouchers = self.env['voucher.history'].sudo().search([('voucher_id','=',self_obj.id),('transaction_type','=','debit')])
		if self_obj.customer_type == 'general' and self_obj.total_available == 0:
			result['type']		= _('ERROR')
			result['message']	= _('Total Availability of this Voucher is 0. You can`t redeem this voucher anymore !!!')
			return result
		if self_obj.customer_type == 'general' and self_obj.total_available > 0 or self_obj.total_available==-1:
			if len(used_vouchers) >= self_obj.available_each_user and self_obj.available_each_user != -1:
				result['type']		= _('ERROR')
				result['message']	= _('Total Availability of this Voucher is 0. You can`t redeem this voucher anymore !!!')
				return result
		if datetime.now().date() < datetime.strptime(self_obj.issue_date,'%Y-%m-%d').date():
			result['type']		= _('ERROR')
			result['message']	= _('Voucher does not exist.')
			return result
		if datetime.strptime(self_obj.expiry_date,'%Y-%m-%d').date() < datetime.now().date():
			result['type']		= _('ERROR')
			result['message']	= _('This Voucher has been expired on (%s) !!!')%self_obj.expiry_date
			return result
		if self_obj.applied_on == 'specific':
			templ_ids = []
			prd_prices = []
			for prod_id in product_ids:
				prod = self.env['product.product'].browse(prod_id)
				templ_id = prod.product_tmpl_id.id
				templ_ids.append(templ_id)
				if templ_id in self_obj.product_ids.ids:
					prd_prices.append(prod.lst_price)
			if prd_prices:
				total_prod_voucher_price += sum(prd_prices)
			contains = set(templ_ids) & set(self_obj.product_ids.ids)
			if not contains:
				result['type']		= _('ERROR')
				result['message']	= _('This voucher is not applicable on the selected products.')
				return result
		if self_obj.use_minumum_cart_value and wk_order_total and wk_order_total < self_obj.minimum_cart_amount:
			result['type']		= _('ERROR')
			result['message']	= _('In order to use this voucher your total order should be greater than%s')%self_obj.minimum_cart_amount
			return result
		if self_obj.customer_type == 'special_customer':
			if self_obj.customer_id.id != partner_id:
				result['type']		= _('ERROR')
				result['message']	= _('Voucher doesn`t exist !!!')
				return result
			if self_obj.is_partially_redemed and self_obj.redeemption_limit != -1:
				if used_vouchers and  len(used_vouchers) >= self_obj.redeemption_limit:
					result['type']		= _('ERROR')
					result['message']	= _('Voucher has been Redeemed to its maximum limit.')
					return result
			history_objs  = self.env['voucher.history'].search([('voucher_id','=',self_obj.id)])
			amount_left = 0
			for hist_obj in history_objs:
				amount_left += self_obj._get_amout_left_special_customer(hist_obj)
			if amount_left <= 0.0:
				result['type']		= _('ERROR')
				result['message']	= _('Total Availability of this Voucher is 0. You can`t redeem this voucher anymore !!!')
				return result
			else:
				voucher_value = amount_left
		result = defaults
		result['status'] = True
		result['type']  =_('SUCCESS')
		result['value'] = voucher_value
		result['coupon_id'] = self_obj.id
		result['coupon_name'] = self_obj.name
		result['total_available'] = self_obj.total_available
		result['voucher_val_type'] = self_obj.voucher_val_type
		result['customer_type'] = self_obj.customer_type
		result['redeemption_limit'] = self_obj.redeemption_limit
		result['applied_on'] = self_obj.applied_on
		result['product_ids'] = self_obj.product_ids.ids
		result['total_prod_voucher_price'] = total_prod_voucher_price
		unit = ''
		if self_obj.voucher_val_type == 'percent':
			unit = 'percent'
		else:
			unit = 'amount'
		result['message']  =_('Validated successfully. Using this voucher you can make discount of %s %s.')%(voucher_value,unit)
		return result

	@api.model
	def validate_voucher(self, secret_code, wk_order_total, products_list ,refrence=False, partner_id=False):
		result = self._validate_n_get_value(secret_code, wk_order_total, products_list, refrence, partner_id)
		return result

	@api.model
	def redeem_voucher_create_histoy(self, voucher_name=False, voucher_id=False, amount=False, order_id=False, order_line_id=False, refrence=False):
		result = {}
		status = False
		hist_values = {}
		history_obj = False
		if voucher_name and voucher_id and refrence:
			if amount > 0:
				amount = -amount
			hist_values = {
					'name':voucher_name,
					'voucher_id':voucher_id,
					'voucher_value':amount,
					'channel_used':refrence,
					'transaction_type':'debit',
				}
			if refrence == 'ecommerce':
				hist_values['sale_order_line_id'] = order_line_id
				hist_values['order_id'] = order_id
				history_obj = self.env['voucher.history'].sudo().create(hist_values)
				result['history_id'] = history_obj.id
			voucher_obj  = self.env['voucher.voucher'].sudo().browse(voucher_id)
			status = True
			voucher_obj  = self.browse(voucher_id)
			if voucher_obj.customer_type == 'general':
				if voucher_obj.total_available > 0:
					voucher_obj.sudo().write({'total_available':voucher_obj.total_available - 1,'date_of_last_usage':datetime.now().date()})
			result['status'] = status
			
		return result

	@api.model
	def return_voucher(self, coupon_id, line_id, refrence=False, history_id=False):
		voucher_obj = self.browse(coupon_id)
		if voucher_obj.customer_type == 'general' and voucher_obj.total_available >= 0:
			if voucher_obj.total_available != -1:
				voucher_obj.sudo().write({'total_available':voucher_obj.total_available + 1})
		if voucher_obj.customer_type == 'special_customer':
			if refrence ==  'ecommerce':
				history_obj = self.env['voucher.history'].search([('sale_order_line_id','=',line_id)])
				history_obj.unlink()
		return True