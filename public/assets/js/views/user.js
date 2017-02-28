window.UserView = Backbone.View.extend({
    events: {
        "click #btnUserEdit": "editUser",
        "click .classBtn": "getClass",
    },


    getClass: function (e) {
        //Separa o id da escola do id da turma
        var ids = $(e.currentTarget).attr("id").split(":");
        showClassInfo(ids[0], ids[1]);
    },

    verAluno: function (btn) {
        //Variavel a enviar, para depois poder buscar os dados do aluno a consultar
        window.sessionStorage.setItem("Aluno", $(btn).attr("val"));
        app.navigate('student/view', {
            trigger: true
        });
    },

    editUser: function (obj) {
        //Variavel a enviar, para depois poder buscar os dados do professor a editar
        window.sessionStorage.setItem("ProfEditar", window.localStorage.getItem('ProfID'));
        app.navigate('teachers/edit', {
            trigger: true
        });
    },

    initialize: function () {
        var self = this;
    },

    render: function () {
        var self = this;

        var data = self.model.toJSON();
        //$(".sidebar-toggle", self.el).remove();
        $(self.el).html(self.template(data));
        $('.aboveMenu', this.el).i18n();
        return this;
    }

});
