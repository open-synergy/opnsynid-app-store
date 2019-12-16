# -*- encoding: utf-8 -*-

{
    "name": "Pdf Print Preview",
    "version": "1.0",
    "depends": ["report"],
    "author": "itechgroup",
    "category": "Reports",
    "website": "",
    "summary": "Preview and print PDF report in your browser",
    "description": """
            Preview and print PDF report in your browser
            Features:
                - PDF report preview, in current tab.
                - PDF report preview, in another tab.
                - Load report in another tab with print by default.
    """,
    "data": [
        "views/assets.xml",
        "views/res_users.xml"
    ],
    "qweb": [
        "static/src/xml/*.xml"
    ],
    "images": [ "static/description/banner.png" ],
    "installable": True,
    "application": True,
    "license": "OPL-1",
    "currency": "EUR",
    "price": 25.99
}
