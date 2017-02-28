window.TeachersView = Backbone.View.extend({

    events: {
        "click #newteacherbtn": "newTeacher",
        "click #deletebtn": "deleteTeacher",
        "keyup #txtSearch": "searchProf",
        'click .listButton': "enchePreview",
        "click .delete": "confirmDelete",

        "click #orderBy": "orderProfs"
    },

    orderProfs: function (e) {
        var mylist = $('#teachersContent');

        orderContentList(mylist, e);
    },
    //filtra os profs que correspondem à pesquisa (case insensitive)
    searchProf: function (e) {
        $(".listButton").hide();
        $(".listButton:containsi(" + $(e.currentTarget).val() + ")").show();
    },
    //New Teacher
    newTeacher: function (e) {
        e.preventDefault();
        app.navigate('/teachers/new', {
            trigger: true
        });
    },

    //Solicita confirmação para apagar o professor
    confirmDelete: function (e) {

        var id = $(e.currentTarget).parent().parent().attr("id");
        var nome = $(e.currentTarget).parent().parent().attr("value");

        var modal = delModal("Apagar professor",
            "Tem a certeza que pretende eliminar o professor <label>" + nome + " </label> ?",
            "deletebtn", id);

        $('#teachersDiv').append(modal);
        $('#modalConfirmDel').modal("show");
    },

    deleteTeacher: function (e) {
        var self = this;
        $('#modalConfirmDel').modal("hide");
        //Apaga o professor seleccionado

        var teacher = new Teacher({id: e.target.value})

        teacher.destroy({
            success: function () {
                sucssesMsg($("#teachersDiv"), "Professor apagado com sucesso!");
                setTimeout(function () {
                    document.location.reload(true);
                }, 2000);
            },
            error: function () {
                failMsg($("#teachersDiv"), "Lamentamos mas não foi possível eliminar o professor!", 1000);
            }
        });


    },

    enchePreview: function (e) {
        var self = this;
        //gets model info
        var teacherData = self.collection.getByID($(e.currentTarget).attr("id"));
        var $hr = '<div class="col-md-12" ><hr class="dataHr"></div>';
        $('#teachersPreview').empty();

        var $divFoto = $("<div>", {
            class: "col-md-3"
        }).append('<img src="' + teacherData.b64 + '"  class="dataImage">');

        var $divDados = $("<div>", {
            class: "col-md-8"
        })
            .append('<label class="col-md-12 dataSubTitle">' + getUserRole(teacherData.permissionLevel) + '</label><br>')
            .append('<label class="col-md-4 lblDataDetails">E-mail:</label> <label class="col-md-8">' + teacherData._id + '</label><br>')
            .append('<label class="col-md-4 lblDataDetails">Telefone:</label> <label  class="col-md-8">' + teacherData.phoneNumber + ' </label><br>')

        $('#teachersPreview').append($('<label>', {
                class: "dataTitle col-md-12", text: teacherData.name
            }), $hr, $divFoto, $divDados)
            .append('<div class="col-md-12" ><hr class="dataHr"></div><div id="classesList" class="col-md-12" align=left></div>')
        ;
        $('#classesList').append('<div id="prfSchool" class="col-md-12" align=left></div>');
        var nTurmas = 0;
        $.each(teacherData.classes, function (iS, school) {
            $.each(school.class, function (iS, classe) {
                var $class = $('<button>', {class: "classBtn", html: classe.name}).click(function () {
                        showClassInfo(school.id, classe._id)
                    }
                );
                //Se a escola já estiver listada, e a turma não, adiciona a turma
                if (!$('div#' + school.id).length) {
                    var $row = $("<div>", {
                        class: "row",
                        id: school.id
                    }).append($("<div>", {
                        class: "col-md-12 col-sm-12"
                    }).append('<i class="fa fa-university"></i>' +
                        '<label style="margin-left: 7px;">' + school.name + '</label>').append(
                        '</br>'));
                    $("#prfSchool").append($row);

                }
                $('div#' + school.id).append($class);

                nTurmas++;

            });

        });

        $("#prfSchool").prepend(
            $('<label>', {id: "assocClasses", text: 'Turma(s) associada(s) '}),
            $('<label>', {class: "badge", text: " " + nTurmas})
        )
        ;
    },

    //Class Initializer
    initialize: function () {
        this.data = this.collection.toJSON();
    },

    render: function () {
        var self = this;
        self.data.sort(sortJsonByCol('title'));
        $(this.el).html(this.template({collection: self.data}));
        return this;
    },
})
;
