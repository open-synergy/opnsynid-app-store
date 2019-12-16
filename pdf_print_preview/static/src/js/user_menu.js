odoo.define("pdf_print_preview.report_menu", function (require) {
    "use strict";

    var UserMenu = require("web.UserMenu");
    var session = require("web.session");

    UserMenu.include({
        on_menu_preview: function() {
            var self = this;
            this.getParent().clear_uncommitted_changes().then(function() {
                self.rpc("/web/action/load", { action_id: "pdf_print_preview.action_short_preview_print" }).done(function(result) {
                    result.res_id = session.uid;
                    self.getParent().action_manager.do_action(result);
                });
            });
        },
    });

});
