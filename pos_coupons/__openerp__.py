# -*- coding: utf-8 -*-
######################################################
# Copyright (c) 2016-Present Webkul Software Pvt. Ltd.
# (<https://webkul.com/>)
######################################################
{
    "name": "Pos Coupons And Vouchers",
    "category": "Point of sale",
    "summary": """
        Add an option in existing Point Of Sale to Create and Use Coupons/Vouchers on Current Order.""",
    "description": """
====================
**Help and Support**
====================
.. |icon_features| image:: pos_coupons/static/src/img/icon-features.png
.. |icon_support| image:: pos_coupons/static/src/img/icon-support.png
.. |icon_help| image:: pos_coupons/static/src/img/icon-help.png

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_
    """,
    "sequence": 1,
    "author": "Webkul Software Pvt. Ltd.",
    "website": "http://www.webkul.com",
    "version": "2.0",
    "depends": [
        "wk_coupons",
        "point_of_sale"
    ],
    "data": [
        "views/inherited_voucher_history_view.xml",
        "views/pos_coupons_view.xml",
        "views/templates.xml",
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    "installable": True,
    "application": True,
    "auto_install": False,
    "price": 125,
    "currency": "EUR",
    "images":[
        "static/description/Banner.png"
    ],
    "pre_init_hook": "pre_init_check",
}
