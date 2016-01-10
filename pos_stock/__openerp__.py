# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
{
    "name": "Pos Stock",
    "category": 'point_of_sale',
    "summary": """
        This module is use to display clock in running point of sale session.""",
    "description": """ This module is use to display clock in running point of sale session."",

====================
**Help and Support**
====================
.. |icon_features| image:: pos_stock/static/src/img/icon-features.png
.. |icon_support| image:: pos_stock/static/src/img/icon-support.png
.. |icon_help| image:: pos_stock/static/src/img/icon-help.png

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_
    """,
    "sequence": 1,
    "author": "Webkul Software Pvt. Ltd.",
    "website": "http://www.webkul.com",
    "version": '1.0',
    "depends": ['point_of_sale'],
    "data": [
        'views/pos_stock_view.xml',
        'views/pos_stock_js.xml',
        # 'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/pos_stock.xml',
    ],
    "installable": True,
    "application": True,
    "auto_install": False,
    #"price": 13,
    #"currency": 'EUR',
}