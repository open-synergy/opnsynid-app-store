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
from openerp.osv import osv, fields
from openerp import SUPERUSER_ID

class sync_group_session(osv.Model):
    _inherit = 'im_chat.session'
    
    _columns = {
        'is_group': fields.boolean("Is Group"),
        'group_id': fields.many2one("mail.group", string="Group Id")
    }

    def update_state(self, cr, uid, uuid, state=None, is_group=False, context=None):
        res = super(sync_group_session, self).update_state(cr, uid, uuid, state, context=context)
        if(is_group):
            domain = [('user_id','=', uid), ('session_id','=',uuid), ('state', '=', 'closed')]    
            group_user_id = self.pool.get('im_chat.conversation_state').search(cr, uid, domain, context=context)
            self.pool.get('im_chat.conversation_state').unlink(cr, SUPERUSER_ID, group_user_id, context=context)
        return res

    def users_infos(self, cr, uid, ids, is_group=False, context=None):
        if(is_group):
            followers_obj = self.pool.get('mail.followers')
            partner_ids = []
            for session in self.browse(cr, uid, ids, context=context):
                follower_ids = followers_obj.search(cr, uid, [('res_id', '=', session.group_id.id),('res_model', '=', 'mail.group')], context=context)
                for follower_id in followers_obj.browse(cr, uid, follower_ids, context=context):
                    partner_ids.append(follower_id.partner_id.id)

            res_users_obj = self.pool.get('res.users')
            user_ids = res_users_obj.search(cr, uid, [('partner_id', 'in', partner_ids)], context=context)
            users_infos = []
            for user_id in res_users_obj.browse(cr, uid, user_ids, context=context):
                users_infos.append({'im_status': user_id.im_status, 'id': user_id.id, 'name': user_id.name})
            return users_infos
        else:
            return super(sync_group_session, self).users_infos(cr, uid, ids, context=context)

    def session_info(self, cr, uid, ids, is_group=False, context=None):
        for session in self.browse(cr, uid, ids, context=context):
            info = {
                'uuid': session.uuid,
                'users': session.users_infos(is_group),
                'state': 'open',
                'is_group': session.group_id.name,
            }
            if uid:
                domain = [('user_id','=',uid), ('session_id','=',session.id)]
                uid_state = self.pool['im_chat.conversation_state'].search_read(cr, uid, domain, ['state'], context=context)
                if uid_state:
                    info['state'] = uid_state[0]['state']
            
            for follower_id in info['users']:
                self.add_user(cr, uid, info['uuid'], follower_id['id'], is_group, context=context)
            return info
        return super(sync_group_session, self).session_info(cr, uid, ids, context=context)

    def session_get(self, cr, uid, user_to, is_group=False, context=None):
        session_id = False
        if(is_group):
            sids = self.search(cr, SUPERUSER_ID, [('is_group', '=', True), ('group_id','=', user_to)], context=context, limit=1)
            for sess in self.browse(cr, SUPERUSER_ID, sids, context=context):
                if sess.id:
                    session_id = sess.id
                    break
            else:
                session_id = self.create(cr, SUPERUSER_ID, {'group_id': user_to, 'is_group': True}, context=context)
            user_info = self.session_info(cr, SUPERUSER_ID, [session_id], is_group, context=context)
            return user_info
        else:
            if user_to:
                sids = self.search(cr, uid, [('user_ids','in', user_to),('user_ids', 'in', [uid]), ('is_group', '=', False)], context=context, limit=1)
                for sess in self.browse(cr, uid, sids, context=context):
                    if len(sess.user_ids) == 2 and sess.is_private():
                        session_id = sess.id
                        break
                else:
                    session_id = self.create(cr, uid, { 'user_ids': [(6,0, (user_to, uid))], 'is_group': False}, context=context)
            return self.session_info(cr, uid, [session_id], context=context)
        super(sync_group_session, self).session_get(cr, uid, user_to, context=None)
    
    def add_user(self, cr, uid, uuid, user_id, is_group=False, context=None):
        if(is_group):
            sids = self.search(cr, uid, [('uuid', '=', uuid)], context=context, limit=1)
            for session in self.browse(cr, uid, sids, context=context):
                if user_id not in [u.id for u in session.user_ids]:
                    self.write(cr, uid, [session.id], {'user_ids': [(4, user_id)]}, context=context)
        else:            
            super(sync_group_session, self).add_user(cr, uid, uuid, user_id, context=context)               

class mail_group(osv.Model):
    _inherit = "mail.group"

    def followes_check(self, cr, uid, ids, context=None):
        group_id = self.pool.get('mail.group').browse(cr, uid, ids, context=context)
        followers_obj = self.pool.get('mail.followers')
        follower_ids = followers_obj.search(cr, uid, [('res_id', '=', group_id and group_id.id or False), ('res_model', '=', 'mail.group')], context=context)
        current_user = self.pool.get('res.users').browse(cr, uid, uid, context=context)

        for follower_id in followers_obj.browse(cr, uid, follower_ids, context=context):
            if(follower_id.partner_id.id == current_user.partner_id.id):
                return True
        return False

    def sync_search(self, cr, uid, name, limit=20, context=None):
        query_params = ()
        result = []

        if name:
            query_params = query_params + ('%'+name+'%',)

        cr.execute('''SELECT id, name FROM mail_group ORDER BY name desc''')       
        # if(query_params):
        #     cr.execute('''SELECT id, name FROM mail_group 
        #             WHERE name ILIKE %s ORDER BY name desc ''', query_params)
        result = result + cr.dictfetchall()
        return result
    
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: