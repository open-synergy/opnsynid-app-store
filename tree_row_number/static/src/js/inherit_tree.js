openerp.tree_row_number = function (instance, m) {
    var _t = instance.web._t,
        QWeb = instance.web.qweb;

    instance.web.ListView.List.include({
    render_record: function (record) {
        var self = this;
        var index = this.records.indexOf(record);
        return QWeb.render('ListView.row', {
            columns: this.columns,
            options: this.options,
            record: record,
            zika:this.records.indexOf(record),
            row_parity: (index % 2 === 0) ? 'even' : 'odd',
            view: this.view,
            render_cell: function () {
                return self.render_cell.apply(self, arguments); }
        });
    }
    });
}