openerp.pdf_print_preview = function(instance) {

    var _t = instance.web._t,
        _lt = instance.web._lt;
    var session = instance.session;
    var Session = openerp.Session;
    var QWeb = instance.web.qweb;

    // Messages that will be shown to the user (if needed).
    var WKHTMLTOPDF_MESSAGES = {
        "install": _lt("Unable to find Wkhtmltopdf on this \nsystem. The report will be shown in html.<br><br><a href='http://wkhtmltopdf.org/' target='_blank'>\nwkhtmltopdf.org</a>"),
        "workers": _lt("You need to start OpenERP with at least two \nworkers to print a pdf version of the reports."),
        "upgrade": _lt("You should upgrade your version of\nWkhtmltopdf to at least 0.12.0 in order to get a correct display of headers and footers as well as\nsupport for table-breaking between pages.<br><br><a href='http://wkhtmltopdf.org/' \ntarget='_blank'>wkhtmltopdf.org</a>"),
        "broken": _lt("Your installation of Wkhtmltopdf seems to be broken. The report will be shown in html.<br><br><a href='http://wkhtmltopdf.org/' target='_blank'>wkhtmltopdf.org</a>")
    };

    // var PreviewDialog = require("pdf_print_preview.PreviewDialog");

    var wkhtmltopdf_state;


    var pdfPreview = instance.web.Class.extend({

        preview: function( url ) {
            var result = $.Deferred();  
            var urlTempalte = _.template("/pdf_print_preview/static/lib/PDFjs/web/viewer.html?file=<%= url %>");
            result.resolve($(QWeb.render("PDFjsFrame", {url: urlTempalte({url})})));

            return $.when(result);        
        }

    });


   var previewDialog = instance.web.Widget.extend({
        init: function(parent, pdfPreview, url, title) {
            this._super(parent);
            this._opened = $.Deferred();
            this.title = title || _t("Preview");
            this.url = url;
            this.$modal = $(QWeb.render("PreviewDialog", {title: this.title, url: this.url}));
            this.$modal.on("hidden.bs.modal", _.bind(this.destroy, this));
            this.$modal.find(".preview-maximize").on("click", _.bind(this.maximize, this));
            this.$modal.find(".preview-minimize").on("click", _.bind(this.minimize, this));
            this.pdfPreview = pdfPreview;
        },
        renderElement: function() {
            this._super();
            var self = this;

            this.pdfPreview.preview(this.url).then(function($content) {
                self.setElement($("<div/>").addClass("modal-body preview-body").append($content));
            });
        },
        open: function() {
            var self = this;
            $(".tooltip").remove();
            this.replace(this.$modal.find(".modal-body")).then(function() {
                self.$modal.modal("show");
                self._opened.resolve();
            });
            return self;
        },
        maximize: function(e) {
            this.$modal.find(".preview-maximize").toggle();
            this.$modal.find(".preview-minimize").toggle();
            this.$modal.addClass("modal-fullscreen");
            
        },
        minimize: function(e) {
            this.$modal.find(".preview-maximize").toggle();
            this.$modal.find(".preview-minimize").toggle();
            this.$modal.removeClass("modal-fullscreen");
        },
        close: function() {
            this.$modal.modal("hide");
        },
        destroy: function(reason) {
            $(".tooltip").remove();
            if(this.isDestroyed()) {
                return;
            }
            this.trigger("closed", reason);
            this._super();
            this.$modal.modal("hide");
            this.$modal.remove();
            setTimeout(function () {
                var modals = $("body > .modal").filter(":visible");
                if(modals.length) {
                    modals.last().focus();
                    $("body").addClass("modal-open");
                }
            }, 0);
        }
    });

    Session.include({
        session_reload: function () {
            var self = this;
            return self.rpc("/web/session/get_session_info", {}).then(function(result) {
                delete result.session_id;
                self.rpc( "/pdf_print_preview/get_session", {}).then(function(data) {
                    
                    _.extend(self, Object.assign(result, data));
                });
            });
        }
    });

   instance.web.ActionManager.include({
        ir_actions_report_xml: function (action, options) {
            var self = this;

            action = _.clone(action);
            var active_ids_path = "/" + action.context.active_ids.join(",");
            var url = "/report/pdf/" + action.report_name + active_ids_path;

            if (action.report_type === "qweb-pdf" && session.preview_print) {
                instance.web.blockUI();
                (wkhtmltopdf_state = wkhtmltopdf_state || session.rpc("/report/check_wkhtmltopdf")).then(function (state) {
                    if (WKHTMLTOPDF_MESSAGES[state]) {
                    self.do_notify( _t("Report"), WKHTMLTOPDF_MESSAGES[state], true);

                    }
                    var filename = action.report_name;
                    var title = action.name;
                    var newUrl = url;
                    var def = $.Deferred()
                    if( title !== undefined )
                        newUrl +="?"+ title.replace(/[/?%#&=]/g, "") + ".pdf";

                    new previewDialog(self, new pdfPreview(), newUrl, title).open();

                    instance.web.unblockUI();
                });

            } 

            if (session.automatic_printing) {
               
                try {
                    var pdf = window.open(url);
                    pdf.print();
                }
                catch(err) {
                   self.do_notify( _t("Report"), _t( "Please allow <b style='color: red;'>pop up</b> in your browser to <b>preview report</> in another tab." ), true);
                }
                
            }

            if (!session.automatic_printing && !session.preview_print) {
                return self._super(action, options);
            }
        }
    });

    instance.web.UserMenu.include({
        on_menu_preview: function() {
            var self = this;

            if (!this.getParent().has_uncommitted_changes()) {
                self.rpc("/web/action/load", { action_id: "pdf_print_preview.action_short_preview_print" }).done(function(result) {
                    result.res_id = instance.session.uid;
                    self.getParent().action_manager.do_action(result);
                });
            }
        },
    });
};

