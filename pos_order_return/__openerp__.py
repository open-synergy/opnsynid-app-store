# -*- coding: utf-8 -*-
#################################################################################
# Author      : Webkul Software Pvt. Ltd. (<https://webkul.com/>)
# Copyright(c): 2015-Present Webkul Software Pvt. Ltd.
# All Rights Reserved.
#
#
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
#
# You should have received a copy of the License along with this program.
# If not, see <https://store.webkul.com/license.html/>
#################################################################################
{
  "name"                 :  "POS Order Return",
  "summary"              :  "This module is use to Return orders in the running point of sale session.",
  "category"             :  "Point Of Sale",
  "version"              :  "3.6.2",
  "sequence"             :  1,
  "author"               :  "Webkul Software Pvt. Ltd.",
  "license"              :  "Other proprietary",
  "website"              :  "https://store.webkul.com/Odoo-POS-Order-Return.html",
  "description"          :  """https://store.webkul.com/Odoo-POS-Order-Return.html""",
  "live_test_url"        :  "",
  "depends"              :  ['pos_orders'],
  "data"                 :  [
                             'views/template.xml',
                             'views/pos_order_return_view.xml',
                            ],
  "qweb"                 :  ['static/src/xml/*.xml'],
  "images"               :  ['static/description/Banner.png'],
  "application"          :  True,
  "installable"          :  True,
  "auto_install"         :  False,
  "price"                :  22,
  "currency"             :  "EUR",
}