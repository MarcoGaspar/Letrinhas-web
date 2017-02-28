window.QuestionsConnectionsNew = Backbone.View.extend({
    events: {
        "change #selectOptionType": "setOptionType",
        "change #selectMatchType": "setMatchType",


        "change #rightAnswer": "getAnswer",
        "blur .emptyField": "isEmpty",
        "click #btnCrop": "getFoto",

        "change input[type=file]": "getImage",
        "click .fa-trash": "rmvConnect",
        "click #addConnect": "addConnect",
        "mouseover #subTxt": "pop",
        "submit": "beforeSend"

    },
    //Initializes popover content
    pop: function () {
        setPopOver("Ano, Disciplina, Conteúdo, Especificação, Título, Pergunta e Respostas");
    },

    //Changes content input type
    setOptionType: function () {

        var options = $(".option");//numero de opcoes

        //Verigfica qual o tipo de pergunta e apresenta o input respectivo
        switch ($('#selectOptionType').val()) {
            case "text":
                //altera o tipo das opcoes
                $.each(options, function (i, option) {
                    $(option).attr("type", "text")
                });
                break;
            case "image":
                //altera o tipo das opcoes
                $.each(options, function (i, option) {
                    $(option).attr("type", "file")
                });

                break;
        }
    },

    //Changes content input type
    setMatchType: function () {

        var options = $(".match");//numero de opcoes

        //Verigfica qual o tipo de pergunta e apresenta o input respectivo
        switch ($('#selectMatchType').val()) {
            case "text":
                //altera o tipo das opcoes
                $.each(options, function (i, option) {
                    $(option).attr("type", "text")
                });
                break;
            case "image":
                //altera o tipo das opcoes
                $.each(options, function (i, option) {
                    $(option).attr("type", "file")
                });

                break;
        }
    },

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Changes content input type
    getImage: function (e) {
        //Verifica se é imagem
        if ($(e.currentTarget).attr("accept").indexOf("image") != -1) {
            var file = e.target.files[0];

            // Load the image
            var reader = new FileReader();

            reader.onload = function (readerEvent) {
                var image = new Image();
                image.src = readerEvent.target.result;
                //$(e.currentTarget).attr("result") - > input onde sera colocado o resultado do crop
                showCropper(".form", image, 100, 16 / 9, $(e.currentTarget).attr("result"));
            }
            reader.readAsDataURL(file);
        }
    },

    //Recorta a foto
    getFoto: function (e) {
        e.preventDefault();

        var canvas = $("#preview")[0];
        var dataUrl = canvas.toDataURL('image/jpeg');
        $("#" + $(e.currentTarget).attr('value')).val(dataUrl);
        $("#" + $(e.currentTarget).attr('value') + "Img").attr("src", dataUrl);
        $(".cropBG").remove();
    },

    //Adiciona uma opcao e uma correspondencia
    addConnect: function (e) {
        e.preventDefault();
        //Cria uma cor random
        var color = getRandomColor();
        //Conta o numero de ligacoes listadas listadas
        var nOptions = $(".option").length;
        var $option = $();
        var match;

        if (nOptions < 8) {
            //Adiciona a option
            switch ($('#selectOptionType').val()) {
                //Se for do tipo texto adiciona o campo para 1 resp certa e uma errada
                case "text":
                    $option = 'text';
                    break;
                case "image":
                    //adiciona uma img para previsualizar a imagem
                    $option = $option.add($("<span>", {
                        class: "input-group-addon"
                    }).append(
                        $("<img>", {
                            id: "hiddenOption" + nOptions + "Img"
                        })
                    ));
                    //Adiciona o input file
                    $option = $option.add($("<input>", {
                        type: "file", class: "form-control mandatory",
                        id: "option" + nOptions,
                        placeholder: "Opção " + nOptions,
                        accept: "image/*", result: "hiddenOption" + nOptions
                    }));
                    //adiciona o hidden para guardar o b64 da imagem
                    $option = $option.add($("<input>", {
                        type: "hidden", class: "form-control mandatory option", id: "hiddenOption" + nOptions,
                        accept: "image/*"
                    }));

                    break;
            }
            //Adiciona a correspondencia
            switch ($('#selectMatchType').val()) {
                //Se for do tipo texto adiciona o campo para 1 resp certa e uma errada
                case "text":
                    match = 'text';
                    break;
                case "image":
                    match = 'file';
                    break;
            }
            $("#options").append(
                $("<div>", {
                    class: "input-group"
                }).append(
                    $option,
                    $("<span>", {
                        type: "text", class: "input-group-addon btn-white"
                    }).append(
                        $("<i>", {
                            class: "fa fa-trash", style: "color:" + color, value: nOptions
                        })
                    ),
                    $("<input>", {
                        type: match, class: "form-control mandatory match",
                        id: "match" + nOptions,
                        placeholder: "Correspondência " + nOptions
                    })
                )
            )
            $("#option" + nOptions).focus();
        } else {
            failMsg($(".form"), "A pergunta só pode conter oito (8) opções.");
        }
    },
    //remove a opcao e a correspondencia
    rmvConnect: function (e) {
        $(e.currentTarget).parent().parent().remove();
    },

//Before Sending Request To Server
    beforeSend: function (e) {
        e.preventDefault();

        e.preventDefault();
        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        if (isValid) {

            $('#content').append(loadingSpinner());
            //Obtem as respostas e as correspondencias

            var nOptions = $(".option");//numero de opcoes

            var answers = [];

            //Adiciona as opcoes
            $.each(nOptions, function (i, option) {
                answers.push({_id: i + 1, option: $("#option" + i).val(), match: $("#match" + i).val()});
            });
            $("#inputAnswers").val(JSON.stringify(answers));
            //Se algum dos campos estiver vazio
            /*
             modem('POST', 'questions',
             function () {
             sucssesMsg($("body"), "Pergunta inserida com sucesso!");
             setTimeout(function () {
             app.navigate("questions", {
             trigger: true
             });
             }, 1500);
             },
             //Error Handling
             function (xhr, ajaxOptions, thrownError) {
             failMsg($("body"), "Não foi possível inserir a nova pergunta.");
             },
             new FormData($("#newMultimediaTestForm")[0])
             );
             */
        }

    }
    ,


//Class Initializer
    initialize: function () {
    }
    ,

//Class Renderer
    render: function () {
        var self = this;

        getCategories();
        $(this.el).html(this.template());
        return this;
    }

})
;
