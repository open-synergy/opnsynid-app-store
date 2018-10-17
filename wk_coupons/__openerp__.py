# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#
#################################################################################
{
    "name": "Module for merging POS/Website Coupons",
    "category": 'Accounting & Finance',
    "summary": """
        Module for merging POS/Website Coupons""",
    "description": """

====================
**Help and Support**
====================
.. |icon_features| image:: wk_coupons/static/src/img/icon-features.png
.. |icon_support| image:: wk_coupons/static/src/img/icon-support.png
.. |icon_help| image:: wk_coupons/static/src/img/icon-help.png

|icon_help| `Help <https://webkul.com/ticket/open.php>`_ |icon_support| `Support <https://webkul.com/ticket/open.php>`_ |icon_features| `Request new Feature(s) <https://webkul.com/ticket/open.php>`_
    """,
    "sequence": 1,
    "author": "Webkul Software Pvt. Ltd.",
    "website": "http://www.webkul.com",
    "version": '2.0',
    "depends": ['sale','mail'],
    "data": [
        'views/coupon_config_view.xml',
        'views/wk_coupon_view.xml',
        'views/coupon_history_view.xml',
        'report/report.xml',
        'report/report_template.xml',
        'security/ir.model.access.csv',
        'data/coupon_data_view.xml',
        'wizard/wizard_view.xml',
    ],
   
    "installable": True,
    "application": True,
    "auto_install": False,
    #"price": 13,
    #"currency": 'EUR',
    "images":['static/description/Banner.png'],
    'pre_init_hook': 'pre_init_check',
}