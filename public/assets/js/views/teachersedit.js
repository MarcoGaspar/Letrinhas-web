window.TeachersEditView = Backbone.View.extend({
    events: {
        "click #buttonCancelar": "buttonCancelar",
        "change #filePicker": "convertPhoto",
        "click #btnCrop": "getFoto",
        "click #btnEditDetails": "editDetails",

        "click #addTurma": "addTurma",
        "click .deleteClass ": "rmvTurmas",
        "click #btnEditTurmas": "assocTurmas",
        "click .desassocClass": "confirmDesassocTurmas",
        "click #desassocTurma": "desassocTurmas",

        "mouseover #pwdIcon": "verPwd",
        "mouseout #pwdIcon": "escondePwd",
        "keyup #ConfirmPasswd": "confirmPwd",
        "click #btnEditPsw": "editPsw",

    },
    buttonCancelar: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Convert Photo To Base64 String
    convertPhoto: function (e) {
        var file = e.target.files[0];

        // Load the image
        var reader = new FileReader();

        reader.onload = function (readerEvent) {
            var image = new Image();
            image.src = readerEvent.target.result;
            showCropper(".form", image, 300, 1);
        }
        reader.readAsDataURL(file);
    },

    //Recorta a foto
    getFoto: function (e) {
        e.preventDefault();
        var canvas = $("#preview")[0];
        var dataUrl = canvas.toDataURL('image/jpeg');
        $("#base64textarea").val(dataUrl);
        $("#iFoto").attr('src', dataUrl);
        $(".cropBG").remove();
        $(".profile-pic").removeClass("emptyField");
    },

    //Before Sending Request To Server
    editDetails: function (e) {
        var isValid = true;
        e.preventDefault();
        //Send Form Submit To Server

        var teacher = new Teacher({id: this.data._id})
        //Recolhe os dados da view
        var teacherDetails = $('#editTeacherForm').serializeObject();

        teacher.save(teacherDetails, {
            success: function () {
                sucssesMsg($("#editTeacherForm"), "Dados alterados com sucesso.");
                setTimeout(function () {
                    document.location.reload(true);
                }, 1000);
            },
            error: function (model, response) {
                failMsg($("#editTeacherForm"), "Não foi possível alterar os dados. \n (" + JSON.parse(response.responseText).result + ").");
            }
        });

    },

    //Adiciona a escola e a turma ao objecto
    addTurma: function (e) {
        e.preventDefault();
        assocClass();
    },

    //Desassocia todas as escolas e respectivas turmas
    rmvTurmas: function (e) {
        e.preventDefault();
        desassocClass(e.currentTarget);
    },

    //Sends an udate classes to server
    assocTurmas: function (e) {
        var self = this;
        e.preventDefault();
        modem('POST', 'teachers/' + $("#inputEmail").val() + '/editClasses',
            //Response Handler
            function (json) {
                sucssesMsg($("#editTeacherForm"), "Turmas associadas com sucesso.");
                setTimeout(function () {
                    document.location.reload(true);
                }, 1000);
            },
            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
                failMsg($("#editTeacherView"), "Não foi possível alterar os dados. \n (" + JSON.parse(xhr.responseText).result + ").");
            },
            new FormData($('<form>', {}).append(
                $("#assocTurma"),
                $('<input>', {name: "id", value: $("#inputEmail").val()})
            )[0])
        );

    },

    //Solicita confirmação para apagar o professor

    confirmDesassocTurmas: function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().parent().attr("id");
        var nome = $(e.currentTarget).parent().parent().attr("value");
        var modal = delModal("Apagar professor",
            "Tem a certeza que pretende desassociar a turma <label>" + nome + " </label> ?",
            "desassocTurma", id);

        $('#editTeacherForm').append(modal);
        $('#modalConfirmDel').modal("show");
    },

    //Sends an udate classes to server
    desassocTurmas: function (e) {
        var self = this;
        e.preventDefault();
        $('#modalConfirmDel').modal("hide");
        var classe = $(e.currentTarget).attr("value").split(":");

        modem('POST', 'teachers/' + $("#inputEmail").val() + '/removeFromClass',
            //Response Handler
            function (json) {
                sucssesMsg($("#editTeacherForm"), "Turma desassociada com sucesso.");
                setTimeout(function () {
                    document.location.reload(true);
                }, 1005);

            },
            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
                failMsg($("#editTeacherForm"), "Não foi possível alterar os dados. \n (" + JSON.parse(xhr.responseText).result + ").");
            },
            new FormData($('<form>', {}).append(
                $('<input>', {name: "school", value: classe[0]}),
                $('<input>', {name: "class", value: classe[1]})
            )[0])
        );

    },

    verPwd: function () {
        $("#pwdIcon").attr("style", "color:#66cc66");
        $("#InputPasswd").attr("type", "text");

    },

    escondePwd: function () {
        $("#pwdIcon").attr("style", "color:#cccccc");
        $("#InputPasswd").attr("type", "password");
    },

    confirmPwd: function () {
        if ($("#InputPasswd").val() == $("#ConfirmPasswd").val()) {
            $("#confIcon").addClass("glyphicon-ok");
            $("#confIcon").removeClass("glyphicon-remove");
            $("#confIcon").attr("style", "color:#66dd66");
        }
        else {
            $("#confIcon").addClass("glyphicon-remove");
            $("#confIcon").removeClass("glyphicon-ok");
            $("#confIcon").attr("style", "color:#dd6666");

        }
    },

    //Before Sending Request To Server
    editPsw: function (e) {
        var isValid = true;
        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        e.preventDefault();

        if (isValid) {
            $("#txtOldPasswd").val(md5($("#txtOldPasswd").val()));
            $("#txtNewPassword").val(md5($("#txtNewPassword").val()));
            //Send Form Submit To Server
            modem('POST', 'teachers/editPasswd',
                //Response Handler
                function (json) {
                    sucssesMsg($("#editTeacherForm"), "Palavra-passe alterada com sucesso.");
                    setTimeout(function () {
                        document.location.reload(true);
                    }, 1005);
                },
                //Error Handling
                function (xhr, ajaxOptions, thrownError) {

                    failMsg($("#editTeacherForm"), "Não foi possível alterar a password. \n (" + JSON.parse(xhr.responseText).result + ").");
                    setTimeout(function () {
                        document.location.reload(true);
                    }, 1005);
                },
                new FormData($("#frmEditPasswd").append(
                    $('<input>', {name: "id", value: $("#inputEmail").val()}).hide()
                    ) [0]
                )
            )
            ;
        }
    },

    initialize: function (id) {
        this.data = this.model.toJSON();
    },

    render: function () {
        var self = this;

        //Gets teacher data and shows his/her info
        $(this.el).html(this.template(self.data));
        //Preenche as dd das escolas e das turmas
        populateDDSchools();


        return this;
    }
});
