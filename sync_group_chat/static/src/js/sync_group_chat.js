openerp.sync_group_chat = function(instance){

    var QWeb = instance.web.qweb;
    var _t = instance.web._t;
    var USERS_LIMIT = 20;

    instance.sync_group_chat.OnlineUsers = openerp.Widget.extend({
        "template": "im_chat.OnlineUsers",
        events: {
            "click": "activate_user",
        },
        init: function(parent, user) {
            this._super(parent);
            this.set("id", user.id);
            this.set("name", user.name);
            this.set("image_url", 'sync_group_chat/static/src/img/user-group-image.png');   
        },
        start: function() {
            this.$el.data("user", {id:this.get("id"), name:this.get("name")});
            //this.$el.draggable({helper: "clone"});
            //this.on("change:im_status", this, this.update_status);
            //this.update_status();
        },
        //update_status: function(){
        //    this.$(".oe_im_user_online").toggle(this.get('im_status') !== 'offline');
        //    var img_src = (this.get('im_status') == 'away' ? '/im_chat/static/src/img/yellow.png' : '/im_chat/static/src/img/green.png');
        //    this.$(".oe_im_user_online").attr('src', img_src);
        //},
        activate_user: function() {
            this.trigger("activate_user", this.get("id"), true); 
        }         
    });

    instance.im_chat.Conversation.include({
        start: function() {
            var self = this;
            this._super.apply(this, arguments);
            if(self.get("session").is_group){
                self.$(".oe_im_chatview_nbr_messages").text();
            }
        },      
        update_fold_state: function(state){
            return new openerp.Model("im_chat.session").call("update_state", [], {"uuid" : this.get("session").uuid, "state" : state, 'is_group': this.get("session").is_group});
        },
        update_session: function(){
            var self = this;
            this._super.apply(this, arguments);
            if(this.get("session").is_group){
                this.$(".oe_im_chatview_header_name").text(this.get("session").is_group + "(" + this.get("session").users.length + ")");
            }
        }
    });
  
    instance.im_chat.InstantMessaging.include({
        events: {
            "keydown .oe_im_searchbox": "input_change",
            "keyup .oe_im_searchbox": "input_change",
            "change .oe_im_searchbox": "input_change",
        },
        start: function() {
            var self = this;
            this._super(parent);
        },
        search_group_status: function(e) {
            var self = this;
            var mail_model = new openerp.web.Model("mail.group");
            return this.user_search_dm.add(mail_model.call("sync_search", [this.get("current_search"),
                        USERS_LIMIT], {context:new openerp.web.CompoundContext()})).then(function(result) {
                self.$(".oe_im_input").val("");
                var old_widget = self.widget;
                var group_limit = 0;
                self.widget = {};
                self.user = [];
		 self.$(".oe_im_groups").empty();
                _.each(result, function(user) {
                    mail_model.call("followes_check", [user.id]).then(function(is_follow) {
                        if(is_follow){
                            user.image_url = openerp.session.url('/web/binary/image', {model:'res.users', field: 'image_small', id: user.id});
                            var widget = new openerp.sync_group_chat.OnlineUsers(self, user);
                            widget.appendTo(self.$(".oe_im_groups"));
                            widget.on("activate_user", self, self.activate_user);
                            self.widget[user.id] = widget;
                            self.users.push(user);
                        }
                        group_limit++;
                    });
                });
                _.each(old_widget, function(w) {
                    w.destroy();
                });
            });
             
        },
        switch_display: function() {
            var self = this;
            this._super.apply(this, arguments);
            this.search_group_status();
        },
        activate_user: function(user_id, is_group) {
            var self = this;
            var sessions = new openerp.web.Model("im_chat.session");
            if(is_group){
                sessions.call("session_get", [user_id, true]).then(function(session) {
                    self.c_manager.activate_session(session);
                });
            }
            else{
                this._super(user_id);
            }
        }
    });
};
