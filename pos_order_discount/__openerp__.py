# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
##############################################################################

{
    "name": "POS Order Discounts",
    "category": 'point_of_sale',
    "summary": """
        This module is use to give discount in running point of sale session.""",
    "description": """ This module is use to give discount."",

====================
**Help and Support**
====================
.. |icon_features| image:: pos_order_discount/static/src/img/icon-features.png
.. |icon_support| image:: pos_order_discount/static/src/img/icon-support.png
.. |icon_help| image:: pos_order_discount/static/src/img/icon-help.png

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_
    """,
    "sequence": 1,
    "author": "Webkul Software Pvt. Ltd.",
    "website": "http://www.webkul.com",
    "version": '1.0',
    "depends": ['point_of_sale'],
    "data": [
        'views/templates.xml',
        'views/pos_discount_view.xml',
        'data/product.xml',
        # 'security/ir.model.access.csv',
    ],
    # "images":['static/description/order_list.png'],
    'qweb': [
        'static/src/xml/discount.xml',
        'static/src/xml/pos_discount.xml',
    ],
    "installable": True,
    "application": True,
    "auto_install": False,
    "price": 20,
    "currency": 'EUR',
}
