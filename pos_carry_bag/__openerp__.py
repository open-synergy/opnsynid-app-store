# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
{
    "name": "POS: Carry Bag",
    "category": 'Point of sale',
    "summary": """ Option to add Carry-Bag in one-click from a list of all Carry-Bag product(s).""",
    "description": """

====================
**Help and Support**
====================
.. |icon_features| image:: pos_carry_bag/static/src/img/icon-features.png
.. |icon_support| image:: pos_carry_bag/static/src/img/icon-support.png
.. |icon_help| image:: pos_carry_bag/static/src/img/icon-help.png

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_
    """,
    "sequence": 1,
    "author": "Webkul Software Pvt. Ltd.",
    "website": "http://www.webkul.com",
    "version": '1.0',
    'depends': [
        'point_of_sale',
        ],
    "data": [
       'views/pos_carry_bag_js.xml',
       'views/pos_config_bag_view.xml',
       
        # 'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/pos_carry_bag.xml',
    ],
    "images":['static/description/button.png'],
    "installable": True,
    "application": True,
    "auto_install": False,
    "price": 15,
    "currency": 'EUR',
}