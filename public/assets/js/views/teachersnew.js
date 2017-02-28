window.TeachersNewView = Backbone.View.extend({
    events: {

        "click #buttonCancelar": "goBack",

        "change #filePicker": "convertPhoto",
        "click #btnCrop": "getFoto",

        "click #addTurma": "addTurma",
        "click .deleteClass ": "rmvTurmas",

        "mouseover #newteacherbtn": "pop",
        "blur .emptyField": "isEmpty",
        "blur #inputEmail": "isEmailAvail",
        "click #newteacherbtn": "beforeSend"

    },

    //Volta para a página dos professores
    goBack: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Exibe o cropper
    convertPhoto: function (e) {
        var file = e.target.files[0];

        // Load the image
        var reader = new FileReader();

        reader.onload = function (readerEvent) {
            var image = new Image();
            image.src = readerEvent.target.result;
            showCropper("#newteacherform", image, 300, 1);
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


    //Initializes popover content
    pop: function () {
        setPopOver("Nome, E-mail, Telefone, Palavra-passe e Pin");

    },

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Verifica se o e-mail ainda não etstá registado
    isEmailAvail: function (ok) {


        var teacher = new Teacher({id: $("#inputEmail").val()});

        teacher.fetch(function () {
            //Se o email ja estiver a ser usado
            if (teacher.attributes._id) {
                $("#inputEmail").addClass("emptyField");
                $("#inputEmail").parent().find('p').remove();
                $("#inputEmail").parent().append(
                    $('<p>', {
                        html: $("#inputEmail").val() + " já está registado.", style: "color: #c9302c"
                    })
                )
                $("#inputEmail").val("");
            } else {
                $("#inputEmail").removeClass("emptyField");
                $("#inputEmail").parent().find('p').remove()
                ok = true;
            }
        })
    },

    //Before Sending Request To Server
    beforeSend: function (e) {
        var isValid = true;
        e.preventDefault();

        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);

        this.isEmailAvail(isValid);


        //Se o pin não for um numero
        if (!isNumber($("#inputPin").val())) {
            $("#inputPin").addClass("emptyField");
            isValid = false;
        }

        if (!matchingPswds($("#InputPasswd").val(), $("#ConfirmPasswd").val())) {
            $("#InputPasswd").addClass("emptyField");
            $("#ConfirmPasswd").addClass("emptyField");
            return false;
        }
        if (isValid) {
            $('#content').append(loadingSpinner());
            //Recolhe os dados da view
            var teacherDetails = $('#newteacherform').serializeObject();
            //Cria um novo model
            var teacher = new Teacher(teacherDetails);
            //Converte o json das classes em objecto
            teacher.set({classes: jQuery.parseJSON($("#teacherClasses").val())})
            teacher.set({password: md5(teacher.attributes.password)})
            teacher.set({pin: md5(teacher.attributes.pin)})
            teacher.save(null, {
                success: function (user) {
                    sucssesMsg($("#newteacherform"), "Professor inserido com sucesso!");
                    setTimeout(function () {
                        app.navigate("teachers", {
                            trigger: true
                        });
                    }, 1500);
                },
                error: function () {
                    failMsg($("#newteacherform"), "Lamentamos mas não foi possível inserir o professor!", 1000);
                }
            });
        }

    },

    //Class Initializer
    initialize: function () {
        //Get Schools If User Has Required Permissions
        populateDDSchools();
    }
    ,
    //Class Renderer
    render: function () {
        $(this.el).html(this.template());
        //Check User LoggedIn
        if (!window.sessionStorage.getItem("keyo")) {
            //Redirect
            app.navigate('/MenuPrincipal', {
                trigger: true
            });
            return false;
        }
        return this;
    }
})
;
