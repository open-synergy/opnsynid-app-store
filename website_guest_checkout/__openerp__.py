# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#   
#################################################################################
{
    'name': 'Website: Guest Checkout Enable/Disable',
    'category': 'Website',
    'sequence':1,
    'summary': '',
    'website': 'http://www.webkul.com',
    'version': '1.0',
    'description': """
Website Guest Checkout
==========================

        """,
    'author': 'Webkul Software Pvt. Ltd.',
    'depends': ['website_sale','website'],
    'installable': True,
    'data': [
        
        'views/website_guest_checkout.xml',
        
        
       
    ],    
    'application': True,
    "price": 15,
    "currency": 'EUR',
    "images":['static/description/checkout_signup.png']
    
}