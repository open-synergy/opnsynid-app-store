# -*- coding: utf-8 -*-
######################################################
# Copyright (c) 2016-Present Webkul Software Pvt. Ltd.
# (<https://webkul.com/>)
######################################################
from openerp import api, fields, models, _
from openerp import tools
from datetime import datetime, timedelta
import logging
_logger = logging.getLogger(__name__)


class VoucherHistory(models.Model):
    _inherit = "voucher.history"

    pos_order_id = fields.Many2one(
        comodel_name="pos.order",
        string="Pos Order Id"
    )
    pos_order_line_id = fields.Many2one(
        comodel_name="pos.order.line",
        string="Pos OrderLine Id"
    )
