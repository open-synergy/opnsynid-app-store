# -*- coding: utf-8 -*-
import logging
import werkzeug.utils

from openerp import http
from openerp.http import request


class PdfPrintPreview(http.Controller):

    @http.route("/pdf_print_preview/get_session", type="json", auth="user")
    def get_session(self, **values):
        
        user = request.env.user

        return {
            "preview_print": user.preview_print,
            "automatic_printing": user.automatic_printing
        }
