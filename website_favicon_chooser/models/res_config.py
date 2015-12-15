from openerp import models, fields, api, exceptions, _

import logging
_logger = logging.getLogger(__name__)

class website_config_settings(models.TransientModel):

    _inherit = 'website.config.settings'

    favicon = fields.Binary(string="Favicon", related="website_id.favicon")

website_config_settings()