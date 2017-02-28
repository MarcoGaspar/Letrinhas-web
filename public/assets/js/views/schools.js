window.SchoolsView = Backbone.View.extend({
    events: {
        "keyup #txtSearch": "filterBy",
        'click .showClassInfo': "showClassInfo",
        "click .newSchool": "newSchool",
        "click .deleteSchool": "confirmDelete",
        "click .editSchool": "editSchool",
        "click #deletebtn": "deleteSchool",
    },

    //Applys filters
    filterBy: function (e) {
        //Esconde todos os alunos
        $(".schoolItem").hide();
        $(".schoolItem:containsi(" + $(e.currentTarget).val() + ")").show();

        $("#counter").html($(".schoolItem:visible").length + "/" + this.data.length);

    },

    showClassInfo: function (e) {
        e.preventDefault();
        showClassInfo($(e.currentTarget).attr("school"), $(e.currentTarget).attr("id"));
    },

    //Solicita confirmação para apagar o professor
    confirmDelete: function (e) {
        var id = $(e.currentTarget).attr("value");
        var name = $(e.currentTarget).attr("name");
        var modal = delModal("Apagar escola",
            "Tem a certeza que pretende eliminar a escola <label>" + name + " </label> ?",
            "deletebtn", id);

        $('.content-wrapper').append(modal);
        $('#modalConfirmDel').modal("show");
    },

    newSchool: function (e) {
        e.preventDefault();
        app.navigate("/schools/new", {
            trigger: true
        });
    },
    editSchool: function (e) {
        var id = $(e.currentTarget).attr("value");
        app.navigate("/schools/" + id + '/edit', {
            trigger: true
        });
    },

    //Remove School
    deleteSchool: function (e) {
        var self = this;
        $('#modalConfirmDel').modal("hide");
        var school = new School({id: e.target.value})

        school.destroy({
            success: function () {
                sucssesMsg($("#schoolsDiv"), "Escola apagada com sucesso!");
                setTimeout(function () {
                    document.location.reload(true);
                }, 2000);
            },
            error: function (model, response) {
                failMsg($(".content-wrapper"), "Não foi possível remover a escola. \n (" + JSON.parse(response.responseText).result + ").");
            }
        });

    },

    //Class Initializer
    initialize: function () {
        this.data = this.collection.toJSON();
    },
    //Class Renderer
    render: function () {
        var self = this;
        //Render Template
        $(this.el).html(this.template({collection: self.data}));
        $('.translations', this.el).i18n();
        return this;

    }

});
