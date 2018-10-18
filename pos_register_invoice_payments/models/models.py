# -*- coding: utf-8 -*-
#################################################################################
#
#   Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#   See LICENSE file for full copyright and licensing details.
#   License URL : <https://store.webkul.com/license.html/>
# 
#################################################################################
from openerp import api, fields, models
from openerp.exceptions import ValidationError
import time
import logging
_logger = logging.getLogger(__name__)


class AccountInvoice(models.Model):
	_inherit = "account.invoice"

	@api.one
	def wk_register_invoice_payment(self,kwargs):	
		payment = {
				'payment_expected_currency': self.currency_id.id,
				'partner_id': self.partner_id._find_accounting_partner(self.partner_id).id,
				'amount': self.type in ('out_refund', 'in_refund') and -kwargs.get('amount') or kwargs.get('amount'),
				'close_after_process': True,
				'invoice_type': self.type,
				'invoice_id': self.id,
				'journal_id':kwargs.get('journal_id'),
				'default_type': self.type in ('out_invoice','out_refund') and 'receipt' or 'payment',
				'type': self.type in ('out_invoice','out_refund') and 'receipt' or 'payment',
				'memo':kwargs.get('memo') or '',
				'reference':kwargs.get('reference') or ''
			}
		
		domain = [('journal_id','=',kwargs.get('journal_id')),('state','in',['draft','open'])]
		bank_statement_objs = self.env['account.bank.statement'].search(domain)
		if len(bank_statement_objs):
			bank_statement_obj = bank_statement_objs[0]
			if len(bank_statement_objs) >1:
				bank_statement_objs = bank_statement_objs.filtered(lambda x : x.pos_session_id == kwargs['session_id'])
				if len(bank_statement_objs):
					bank_statement_obj = bank_statement_objs[0]
			bank_statememt_line = self.env['account.bank.statement.line'].create({
				'amount': kwargs.get('amount'),
				'statement_id':bank_statement_obj.id,
				'partner_id':self.partner_id.id,
				'name':self.number
			})
			move_line_id = self.env['account.move.line'].search([('invoice','=',self.id)])			
			if(move_line_id):
				move_line_id = move_line_id[0]
				makeMoveLineDicts = [{
					'counterpart_move_line_id': move_line_id.id,
					'credit':kwargs.get('amount'),
					'debit':0,
					'name':move_line_id.display_name
				}]
				bank_statememt_line.process_reconciliation(makeMoveLineDicts)
		
		return {
			'residual':self.residual,
			'state':self.state
			}