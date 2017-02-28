window.StudentsView = Backbone.View.extend({
    events: {
        "click #newstudentbtn": "newStudent",
        "click #deletebtn": "deleteStudent",
        //'click .listButton': "fillPreview",
        "keyup #txtSearch": "filterBy",
        "click #orderBy": "orderStudents",
        "click #deleteStudent": "confirmDelete",
        "click #editStudent" : "editStudent",
        "click #statStudent" : "statStudent"
    },

    //Solicita confirmação para apagar o professor
    confirmDelete: function (e) {
      console.log('confirmDelete');

        var id = $(e.currentTarget).attr("value");
        var nome = $(e.currentTarget).attr("name");
        console.log(e.currentTarget);
        console.log('id:  '+id);
        console.log('nome:  '+nome);
        console.log('------------------------------------------------');
        var modal = delModal("Apagar escola",
            "Tem a certeza que pretende eliminar o aluno <label>" + nome + " </label> ?",
            "deletebtn", id);


        $('#studentsDiv').append(modal);
        $('#modalConfirmDel').modal("show");
    },

    //Delete Student
    deleteStudent: function (e) {
      console.log('------------------------------------------------');
      console.log('confimaçao apagar');
        e.preventDefault();
        $('#modalConfirmDel').modal("hide");
        var student = new Student({id: e.currentTarget.value});

        student.destroy({
            success: function () {
                sucssesMsg($("#studentsDiv"), "Aluno apagado com sucesso!");
                setTimeout(function () {
                    document.location.reload(true);
                }, 1000);
            },
            error: function (model, response) {
                failMsg($("#studentsDiv"), "Não foi possível remover o aluno. \n (" + JSON.parse(response.responseText).result + ").");
            }
        });
        console.log('------------------------------------------------');

    },

    //Applys filters
    filterBy: function (e) {
        //Esconde todos os alunos
        $(".studentItem").hide();
        $(".studentItem:containsi(" + $(e.currentTarget).val() + ")").show();

        $("#counter").html($(".studentItem:visible").length + "/" + this.data.length)

    },

    orderStudents: function (e) {
        var mylist = $('#studentsContent');

        orderContentList(mylist, e);
    },

    //Fill School Preview
    fillPreview: function (e) {

        var self = this;
        //gets model info
        studentData = self.collection.getByID($(e.currentTarget).attr("id"));
        $('#studentsPreview').empty();
        var $hr = '<div class="col-md-12" ><hr class="dataHr"></div>';
        var $divFoto = $("<div>", {
            class: "col-md-3"
        }).append('<img src="' + studentData.b64 + '"  class="dataImage">');
        console.log( studentData._id );
        var $divDados = $("<div>", {
            class: "col-md-9"
        }).append('<label class="col-md-4 lblDataDetails">Escola:</label> <label class="col-md-8">' + studentData.schoolDetails + '</label><br>')
            .append('<label class="col-md-4 lblDataDetails">Unername:</label> <label class="col-md-8">' + studentData.username + '</label><br>')
            .append('<label class="col-md-4 lblDataDetails">Número:</label> <label class="col-md-8">' + studentData.number + '</label><br>')

        $('#studentsPreview').append(
            $('<div>', {
                class: "dropdown"
            }).append(
                $('<button>', {
                    class: "btn btn-default dropdown-toggle", type: "button",
                    'data-toggle': "dropdown"
                }).append(
                    $('<label>', {
                        class: "dataTitle col-md-12", text: studentData.name + "  "
                    }).append(
                        $('<i>', {
                            class: "fa fa-gear"
                        })
                    )
                ),
                $('<ul>', {
                    class: "dropdown-menu fa fa-gear"
                }).append(
                    $('<li>').append(
                        $('<a>', {
                            href: "#students/" + studentData._id + "/info", html: '  Estatísticas do aluno'
                        }).prepend(
                            '<i class="fa fa-pie-chart"></i>'
                        )
                    ),
                    $('<li>').append(
                        $('<a>', {
                            href: "#students/" + studentData._id + "/edit", html: '  Editar dados do aluno'
                        }).prepend(
                            '<i class="fa fa-edit"></i>'
                        )
                    ),
                    $('<li>').append(
                        $('<a>', {
                            html: '  Eminar aluno',
                            class: 'deleteStudent',
                            id: studentData._id,
                            value: studentData.name
                        }).prepend(
                            '<i class="fa fa-trash"></i>'
                        )
                    )
                )
            ), $hr,
            $divFoto, $divDados, '<div class="col-md-12" ><hr class="dataHr"></div>'
        );
    },


    //New Student Navigation
    newStudent: function (e) {
        e.preventDefault();
        app.navigate('/students/new', true);
    },
    //editar estudante

    editStudent: function (e) {
        var id = $(e.currentTarget).attr("value");
        console.log(id);
        console.log($(e.currentTarget));

        app.navigate("/students/" + id + '/edit', {
            trigger: true
        });

    },
    statStudent: function (e) {
        var id = $(e.currentTarget).attr("value");
        console.log(id);
        console.log($(e.currentTarget));

        app.navigate("/students/" + id + '/info', {
            trigger: true
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

        return this;
    },

});
