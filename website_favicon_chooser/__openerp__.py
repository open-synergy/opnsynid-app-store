{
    "name": "Website Favicon",
    "version": "1.0",
    "author" : "OA Solutions",
    "website": "http://www.oasolutions.co.za",
    "category": "Website",
    "description": """
Website Favicon
===============
An easy to use addon that allows the user to upload a favicon to their Odoo Website.
""",
    "summary": "OA Solutions, Website, Favicon",
    "depends": [
    	'base',
    	'website',
    ],
    "data" : [
        'views/res_config.xml',
        'views/website_layout.xml',
    ],
    "installable": True,
    "price": 1,
    "currency": "EUR",
}