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
  "name"                 :  "POS Invoice Details",
  "summary"              :  "Allows the seller to view the invoice details related to a customer in POS.",
  "category"             :  "Point Of Sale",
  "version"              :  "1.0.1",
  "sequence"             :  1,
  "author"               :  "Webkul Software Pvt. Ltd.",
  "license"              :  "Other proprietary",
  "website"              :  "https://store.webkul.com/Odoo-POS-Invoice-Details.html",
  "description"          :  """https://webkul.com/blog/odoo-pos-invoice-details/""",
  "live_test_url"        :  "",
  "depends"              :  ['point_of_sale'],
  "data"                 :  ['views/template.xml'],
  "qweb"                 :  ['static/src/xml/pos_invoice_details.xml'],
  "images"               :  ['static/description/Banner.png'],
  "application"          :  True,
  "installable"          :  True,
  "auto_install"         :  False,
  "price"                :  39,
  "currency"             :  "EUR",
}