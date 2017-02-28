window.StudentsNewView = Backbone.View.extend({
    events: {
        "click #backbtn": "back",
        "blur .emptyField": "isEmpty",
        "blur #InputUsername": "isUernameValid",
        "keyup #InputUsername": "checkUsername",
        "submit": "beforeSend",
        "change #filePicker": "convertPhoto",
        "click #btnCrop": "getFoto",
        "mouseover #newstudentbtn": "pop"
    },

    //Initializes popover content
    pop: function () {

        setPopOver("Nome, Número, Fotografia, Escola e Turma");

    },
    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Garante que o username nao tem espacos em maiusculas
    checkUsername: function (e) {
        $(e.currentTarget).val($(e.currentTarget).val().trim().toLowerCase())
    },
    isUernameValid: function (e) {
        var student = new Student({});
        //Se o username ja estiver a ser utilizado
        student.exist($(e.currentTarget).val(), function (response) {
            if (response) {
                $(e.currentTarget).addClass("emptyField");
                failMsg($(".form"), "O nome de utilizador " + $(e.currentTarget).val() + " já está a ser utilizado!", 1000);
            } else {
                $(e.currentTarget).removeClass("emptyField");
            }
        })
    },

    //crops a foto
    getFoto: function (e) {
        e.preventDefault();
        var canvas = $("#preview")[0];
        var dataUrl = canvas.toDataURL('image/jpeg');

        $("#base64textarea").val(dataUrl);
        $("#iFoto").attr('src', dataUrl);
        $(".cropBG").remove();
        $(".profile-pic").removeClass("emptyField");
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

    //Return to last visited page
    back: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Before Sending Request To Server
    beforeSend: function (e) {
        e.preventDefault();
        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        if (isValid) {
            var studentDetails = $('#newstudentform').serializeObject();
            //Cria um novo model
            var student = new Student(studentDetails);
            //Converte a password para md5
            student.set({password: md5(student.attributes.password)})
            student.save(null, {
                success: function (user, response) {
                    sucssesMsg($(".form"), response.text);
                    setTimeout(function () {
                        app.navigate("students", {
                            trigger: true
                        });
                    }, 1500);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(ajaxOptions.responseText);
                    failMsg($("body"), json.text);
                }
            });
        }
    },

    //Class Initializer
    initialize: function () {
        //Get Schools If User Has Required Permissions
        populateDDSchools();
    },

    //Class Renderer
    render: function () {
        var self = this;

        $(this.el).html(this.template());

        return this;
    },


});
