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
  "name"                 :  "POS Register Invoice Payments",
  "summary"              :  "CUSTOME:This module allows the seller to view ,register or Unreconciled invoice payments in POS. Payment of invoice can be done by customer's available Outstanding credits or as well as manual payment.",
  "category"             :  "Point Of Sale",
  "version"              :  "1.0.3",
  "sequence"             :  1,
  "author"               :  "Webkul Software Pvt. Ltd.",
  "license"              :  "Other proprietary",
  "website"              :  "https://store.webkul.com/Odoo-POS-Register-Invoice-Payments.html",
  "description"          :  """POS Register Invoice Payment , Register Invoice Payment In POS, Invoice Payment In POS,
                              POS Invoice Payment,POS Invoice Reconcile, Manage Invoice In POS, POS Invoice Validate, POS Invoice
                            """,
  "live_test_url"        :  "",
  "depends"              :  ['pos_invoice_details'],
  "data"                 :  ['views/template.xml'],
  "qweb"                 :  ['static/src/xml/pos_register_invoice_payment.xml'],
  "images"               :  ['static/description/Banner.png'],
  "application"          :  True,
  "installable"          :  True,
  "auto_install"         :  False,
  # "price"                :  150,
  "currency"             :  "EUR",
  "pre_init_hook"        :  "pre_init_check",
}