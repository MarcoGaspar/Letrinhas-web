window.StudentInfo = Backbone.View.extend({
    events: {},

    editStudent: function (e) {
    },

    initialize: function () {
        var self = this;
    },


    render: function () {
        var self = this;
        $(this.el).html(this.template({model: self.data}));
        //verificar se está logado
        return this;
    }

});
