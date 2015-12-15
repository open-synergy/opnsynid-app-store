from openerp import models, fields, api, exceptions, _

import logging
_logger = logging.getLogger(__name__)

class website(models.Model):

    _inherit = 'website'

    favicon = fields.Binary(string="Favicon", filter="*.ico")

website()