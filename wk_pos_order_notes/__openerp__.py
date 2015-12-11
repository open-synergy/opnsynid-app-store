# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2011-2014 Webkul Software Pvt Ltd (<http://webkul.com>).
#    Author : Mohit Chandra (mohit@webkul.com)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': 'POS: Internal Notes',
    'summary': 'Add an Internal Note in Order from POS.',
    'version': '1.0',
    'category': 'Point Of Sale',
    "sequence": 1,
    'description': """
POS Order Notes
=====================================

Salient Features:
----------------
    
.

**Help and Support**
================
.. |icon_features| image:: pos_order_notes/static/src/img/icon-features.png
.. |icon_support| image:: pos_order_notes/static/src/img/icon-support.png
.. |icon_help| image:: pos_order_notes/static/src/img/icon-help.png
 
* For DEMO           - click here ( `VIEW DEMO <http://54.251.33.126:8080/?db=POS_Extensions>`_  ) 

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_ 

""",
    "author": "Webkul Software Pvt. Ltd.",
    'website': 'http://www.webkul.com',
    'data': [
        'views/wk_pos_config.xml',
        'views/wk_pos_order_js.xml'],
    'depends': [
        'point_of_sale',
        ],
    'qweb': [
        'static/src/xml/wk_pos_order_notes.xml',
    ],
    'images': ['static/description/comment.png'],
    "installable": True,
    "application": True,
    "auto_install": False,
    "price": 15,
    "currency": 'EUR',
}
