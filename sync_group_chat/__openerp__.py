# -*- coding: utf-8 -*-
##############################################################################
#    
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015-Today Synconics Technologies Private Ltd.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.     
#
##############################################################################
{
    "name": "Group Chat",
    "version": "1.0",
    "author": "Synconics Technologies Pvt. Ltd.",
    "website": "www.synconics.com",
    "version": "1.0",
    "catagory": "Tools",
    "complexity": "easy",
    "summary": "Odoo Group Chat",
    "description": """
    Group chat is now possible from the Odoo chat service and you can have information of members in the chat bar.

    All the followed groups will be available for group chat. Whenever, you need to send message to the particular group, you just have to double click on the particular group and can start the chat in that group.
    
    Each member of that group will get message if they are online or when they will appear online.
    
    Alternatively, you can also drag and drop additional users from your chat users list into the ongoing conversation.
    """,
    "depends": ["mail", "im_chat"],
	"data": ["views/group_chat.xml"],
    "qweb": ["static/src/xml/*.xml"],
    "price": 30,
    "currency": "EUR",
    "installable": True,
    "auto_install": False
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: