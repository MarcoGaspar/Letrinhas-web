window.SchoolsNew = Backbone.View.extend({
    events: {
        "click #backbtn": "goBack",
        "click #addNewClass": "addNewClass",
        "click .deleteClass": "deleteClass",
        "change #filePicker": "convertPhoto",
        "click #btnCrop": "getFoto",
        "blur .emptyField": "isEmpty",
        "mouseover #subEscola": "pop",
        "submit": "beforeSend"

    },

    //Cancel New School
    goBack: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Adiciona uma nova turma ao array de turmas
    addNewClass: function (e) {
        e.preventDefault();
        var ano = $("#dbYear").val() * 1;
        var design = $("#classDesig").val();
        if (ano != undefined) {
            //Creates new class object
            var newClass = {
                "name": design, "year": ano,
            };
            //IF that class isn't already listed
            if ($("#classesInput").val().indexOf(JSON.stringify(newClass)) == -1) {
                var obj = jQuery.parseJSON($("#classesInput").val());
                obj.push(newClass);
                //Actualiza o nr de turmas
                $("#schoolsBadge").html(obj.length)
                //Limpa o input
                $("#classDesig").val("");
                $("#classesInput").val(JSON.stringify(obj));
                $("#classesList").append(
                    $('<div>', {class: "row"}).append(
                        $('<p>', {class: "col-md-4 col-sm-4", html: ano + "º " + design}),
                        $('<div>', {class: "col-md-8 col-sm-8"}).append(
                            $('<button>', {
                                class: "deleteClass round-button fa fa-trash",
                                value: JSON.stringify(newClass)
                            })
                        )
                    )
                )
            }
        }
    },

    //Removes a listed class
    deleteClass: function (e) {
        e.preventDefault();
        var objToRemove = jQuery.parseJSON($(e.currentTarget).val());
        var obj = jQuery.parseJSON($("#classesInput").val());
        $.each(obj, function (i, classe) {
            if (classe.name == objToRemove.name && classe.year == objToRemove.year) {
                obj.splice(i, 1);
                $(e.currentTarget).parent().parent().remove();
                $("#classesInput").val(JSON.stringify(obj));
                $("#schoolsBadge").html(obj.length)
                return false;
            }
        })
    },

    //Convert Photo To defined size
    convertPhoto: function (e) {
        var file = e.target.files[0];

        // Load the image
        var reader = new FileReader();

        reader.onload = function (readerEvent) {
            var image = new Image();
            image.src = readerEvent.target.result;
            showCropper(".form", image, 300, 16 / 9);

        }
        reader.readAsDataURL(file);
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

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Initializes popover content
    pop: function () {
        setPopOver("Nome, Morada e Fotografia");
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
            //Recolhe os dados da view
            var schoolDetails = $('#newschoolform').serializeObject();
            //Cria um novo model
            var school = new School(schoolDetails);
            //Converte o json das classes em objecto
            school.set({classes: jQuery.parseJSON($("#classesInput").val())})

            school.save(null, {
                success: function (user) {
                    sucssesMsg($(".form"), "Escola inserida com sucesso!");
                    setTimeout(function () {
                        app.navigate("schools", {
                            trigger: true
                        });
                    }, 1500);
                },
                error: function () {
                    failMsg($(".form"), "Lamentamos mas não foi possível inserir a escola!", 1000);
                }
            });
        }
    },

    //Class Renderer
    render: function () {
        $(this.el).html(this.template());
        $('#infoPop').popover();
        return this;
    }
});
