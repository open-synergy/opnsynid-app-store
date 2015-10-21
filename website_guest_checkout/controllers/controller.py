# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
from openerp.http import route,request
import logging
from openerp import http,SUPERUSER_ID 
from openerp.addons.auth_signup.controllers.main import AuthSignupHome
from openerp.tools.translate import _
import re
import werkzeug
from openerp.addons.auth_oauth.controllers.main import OAuthLogin
from openerp.tools.safe_eval import safe_eval
# from openerp.addons.auth_oauth.controllers.main import OAuthLogin

_logger = logging.getLogger(__name__)

class website_guest_checkout(AuthSignupHome):
	""" custom login and sign up methods on controllers"""	
	""" called from js using  json Rpc"""

	@http.route('/checkout/allowsignup/', type='json', auth='public', website=True)
	def allowsignup(self,*args,**kwargs):
		icp=request.registry['ir.config_parameter']		
		# cr,uid=request.cr,request.id
		pk=safe_eval(icp.get_param(request.cr, SUPERUSER_ID, 'auth_signup.allow_uninvited', 'False'))
		# _logger.info("---ir.config_parameterir.config_parameterir.config_parameter-----------------%r---------------",pk)
		
		return str(pk)
		

		

	@http.route('/checkout/login/', type='json', auth='public', website=True)
	def wk_login(self,*args,**kwargs):
		values = request.params.copy()
		values.update({'message':'','status':True})
		if not request.session.db:
			values['message'] = "No Database Selected" 
			values['status'] = False
		if not request.uid:
			request.uid = SUPERUSER_ID
		
		if ((not kwargs.has_key('redirect')) or (kwargs.has_key('redirect') and not kwargs['redirect'])):
			kwargs['redirect'] = "/shop"
		values['redirect'] = kwargs['redirect']	
		old_uid = request.uid
		uid = request.session.authenticate(request.session.db, values['login'], values['password'])
		values['uid'] = uid		
		if uid is not False:
			values['message']="sucessfully login"	
			return values	

		values['message'] = "Wrong login/password"		
		return values	
	@route('/checkout/signup', type='json',auth="public",website=True)
	def  wk_signup(self, *args,**kw):
		res={}		
		qcontext =  request.params.copy()	
				
		try :
			res=self.custom_validate(qcontext)
			values = dict((key, qcontext.get(key)) for key in ('login', 'name', 'password',))
			
			if res['error']=="":
				
				token=""
				db, login, password = request.registry['res.users'].signup(request.cr, SUPERUSER_ID, values, token)
				com=request.cr.commit()    				
				res['com']=com
				uid = request.session.authenticate(db, login, password)
				res['uid']=uid		
		except Exception, e:			
			res['error']=_(e.message)			

		return res				
		

	def custom_validate(self,qcontext):		
		values = dict((key, qcontext.get(key)) for key in ('login', 'name', 'password',))
		pattern = '^[a-zA-Z0-9._%-+]+@[a-zA-Z0-9._%-]+.[a-zA-Z]{2,6}$'
					
		res={}
		res['error']=""
		if not all([k for k in values.values()]):
			res['error'] = res.setdefault('error', '') + ",filled"	
			return res
		if not re.match(pattern, values.get('login')):
			res['error'] = res.setdefault('error', '') + ",email"
			return res
		

		users=request.registry['res.users'].search(request.cr,SUPERUSER_ID,[('login','=',values.get('login'))])     
		if  users!=[]:
		 res['error'] = res.setdefault('error', '')+",register"
		 return res
		if  values.get('password') != qcontext.get('confirm_password'):
			res['error'] = res.setdefault('error', '')+",confirm_password"
			return res
		return res


	
	





   		
    

	


	
 		