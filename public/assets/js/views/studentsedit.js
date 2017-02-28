window.StudentsEdit = Backbone.View.extend({
    events: {
        "click #backbtn": "goBack",
        "submit": "beforeSend",
        "change #filePicker": "convertPhoto",
        "click #btnCrop": "getFoto",
        "mouseover #studentEditbtn": "pop"
    },
    //Initializes popover content
    pop: function () {
        setPopOver("Nome, Número, Fotografia, Escola e Turma");
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
    },

    //Cancel New School
    goBack: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Before Sending Server Request
    beforeSend: function (e) {
        e.preventDefault();
        var self = this;
        //Se algum dos campos estiver vazio
        var allListElements = $("#editstudentform .mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        if (isValid) {
            //Send Student Changes to Server
            var student = new Student({id: self.data._id});
            var studentDetails = $('#editstudentform').serializeObject();
            student.save(studentDetails, {
                success: function () {
                    sucssesMsg($(".form"), "Aluno alterado com sucesso!");
                    setTimeout(function () {
                        app.navigate("students", {
                            trigger: true
                        });
                    }, 1500);
                },
                error: function () {
                    failMsg($(".form"), "Lamentamos mas não foi possível inserir o aluno!", 1000);
                }
            });
        }
    },

    //Class Initializer
    initialize: function (id) {
        var self = this;
        self.data = this.model.toJSON();
        populateDDSchools(self.data.school, self.data.class);
        $("#dbSchools").val(self.data.school)
    },

    render: function () {
        var self = this;
        $(this.el).html(this.template(self.data));

        return this;
    }

});
