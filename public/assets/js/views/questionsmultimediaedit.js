window.QuestionsMultimediaEdit = Backbone.View.extend({
    events: {
        "change #selectContentType": "getContentType",
        "change #selectAnswerType": "getAnswerType",
        "change input[type=file]": "getQuestion",
        "change #rightAnswer": "getAnswer",
        "blur .emptyField": "isEmpty",
        "click #btnCrop": "getFoto",
        "click #addWrngAnswr": "addWrngAnswr",
        "mouseover #subTxt": "pop",
        "submit": "beforeSend"

    },
    //Initializes popover content
    pop: function () {
        setPopOver("Ano, Disciplina, Conteúdo, Especificação, Título, Pergunta e Respostas");
    },
    //Changes content input type
    getContentType: function () {
        $('#questionContent').empty();
        var span = "";
        var elements = $();

        //Verigfica qual o tipo de pergunta e apresenta o input respectivo
        switch ($('#selectContentType').val()) {
            case "text":
                span = "fa fa-font";
                elements = elements.add($("<textarea>", {
                    class: "form-control mandatory",
                    placeholder: "Ex: Qual o resultado de 16 - 7 ?",
                    name: "contentQuest", rows: "5", style: "resize: none;"
                }));
                break;
            case "audio":
                span = "fa fa-file-audio-o";
                elements = elements.add($("<input>", {
                    type: "file", class: "form-control mandatory", id: "questionFile",
                    accept: "audio/mp3",
                    name: "contentQuest"
                }));
                break;
            case "image":
                span = "fa fa-image";
                elements = elements.add($("<input>", {
                    type: "file", class: "form-control mandatory", id: "questionFile",
                    accept: "image/*", result: "base64Question"
                }));
                elements = elements.add($("<input>", {
                    type: "hidden", class: "form-control mandatory", id: "base64Question",
                    name: "contentQuest"
                }));
                elements = elements.add($("<span>", {
                    class: "input-group-addon btn-white"
                }).append($("<img>", {
                    id: "base64QuestionImg"
                })));

                break;
        }

        $('#questionContent').append(
            $("<div>", {
                class: "input-group",
            }).append(
                $("<span>", {
                    class: "input-group-addon btn-white",
                }).append(
                    $("<i>", {
                        class: span, style: "color:#4057BD"
                    })
                ),
                elements
            ));
    },

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Changes answer input type
    getAnswerType: function () {
        $('#rightAnswers ').empty();
        $('#wrongAnswers').empty();
        var rightAnswer = $();
        var wrongAnswer = $();
        switch ($('#selectAnswerType').val()) {
            //Se for do tipo texto adiciona o campo para 1 resp certa e uma errada
            case "text":
                rightAnswer = rightAnswer.add(
                    $("<input>", {
                        type: "text", class: "form-control mandatory",
                        id: "rightAnswer", placeholder: "Resposta correcta"
                    }));
                wrongAnswer = wrongAnswer.add(
                    $("<input>", {
                        type: "text", class: "wrongAnswer form-control mandatory",
                        id: "wrongAnswer0", placeholder: "Resposta incorrecta"
                    })
                );
                break;
            case "image":

                rightAnswer = rightAnswer.add(
                    $("<input>", {
                        type: "file", class: "form-control mandatory",
                        accept: "image/*", result: "rightAnswer"
                    })
                );
                rightAnswer = rightAnswer.add(
                    $("<input>", {
                        type: "hidden", class: "form-control mandatory", id: "rightAnswer",
                        accept: "image/*"
                    })
                );
                rightAnswer = rightAnswer.add($("<span>", {
                    class: "input-group-addon btn-white"
                }).append($("<img>", {
                    id: "rightAnswerImg"
                })));
                wrongAnswer = wrongAnswer.add(
                    $("<input>", {
                        type: "file", class: "form-control mandatory",
                        accept: "image/*", result: "wrongAnswer0"
                    })
                );
                wrongAnswer = wrongAnswer.add(
                    $("<input>", {
                        type: "hidden", class: "form-control mandatory wrongAnswer", id: "wrongAnswer0"
                    })
                );
                wrongAnswer = wrongAnswer.add($("<span>", {
                    class: "input-group-addon btn-white"
                }).append($("<img>", {
                    id: "wrongAnswer0Img"
                })));
                break;
        }
        $('#rightAnswers').append(
            $("<div>", {
                class: "input-group",
            }).append(
                $("<span>", {
                    class: "input-group-addon btn-white",
                }).append(
                    $("<i>", {
                        class: "fa fa-check", style: "color:#A2BD40"
                    })
                ),
                rightAnswer)
        );
        $('#wrongAnswers').append(
            $("<div>", {
                class: "input-group",
            }).append(
                $("<span>", {
                    class: "input-group-addon btn-white",
                }).append(
                    $("<i>", {
                        class: "fa fa-close", style: "color:#BD404C"
                    })
                ),
                wrongAnswer
            )
        )
    },

    //Changes content input type
    getQuestion: function (e) {

        if ($(e.currentTarget).attr("accept").indexOf("image") != -1) {
            var file = e.target.files[0];

            // Load the image
            var reader = new FileReader();

            reader.onload = function (readerEvent) {
                var image = new Image();
                image.src = readerEvent.target.result;
                //$(e.currentTarget).attr("result") - > input onde sera colocado o resultado do crop
                showCropper(".form", image, 300, 16 / 9, $(e.currentTarget).attr("result"));
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

    addWrngAnswr: function (e) {
        e.preventDefault();
        //Conta o numero de respostas erradas listadas
        var nWrongAnswers = $(".wrongAnswer").length;
        if (nWrongAnswers < 3) {
            switch ($('#selectAnswerType').val()) {
                //Se for do tipo texto adiciona o campo para 1 resp certa e uma errada
                case "text":
                    $("#wrongAnswers").append(
                        $("<div>", {
                            class: "input-group"
                        }).append(
                            $("<span>", {
                                type: "text", class: "input-group-addon btn-white"
                            }).append(
                                $("<i>", {
                                    class: "fa fa-close", style: "color:#BD404C"
                                })
                            ),
                            $("<input>", {
                                type: "text", class: "form-control mandatory wrongAnswer",
                                id: "wrongAnswer" + nWrongAnswers,
                                placeholder: "Resposta errada"
                            })
                        )
                    )

                    break;
                case "image":

                    $("#wrongAnswers").append(
                        $("<div>", {
                            class: "input-group"
                        }).append(
                            $("<span>", {
                                type: "text", class: "input-group-addon btn-white"
                            }).append(
                                $("<i>", {
                                    class: "fa fa-close", style: "color:#BD404C"
                                })
                            ),
                            $("<input>", {
                                type: "file", class: "form-control mandatory", id: "InputAsnwer0",
                                accept: "image/*", result: "wrongAnswer" + nWrongAnswers
                            }), $("<input>", {
                                type: "hidden",
                                class: "form-control mandatory wrongAnswer",
                                id: "wrongAnswer" + nWrongAnswers,
                            }),
                            $("<span>", {
                                class: "input-group-addon btn-white"
                            }).append($("<img>", {
                                id: "wrongAnswer" + nWrongAnswers + "Img"
                            }))
                        )
                    )


                    break;
            }

            $("#wrongAnswer" + nWrongAnswers).focus();
        } else {
            failMsg($(".form"), "A pergunta só pode conter quatro (3) opções erradas.");
        }
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


            //Obtem as respostas erradas
            var nWrongAnswers = $(".wrongAnswer");
            var answers = [];
            //Adiciona a primeira resposta  (correcta)
            answers.push({_id: 0, content: $("#rightAnswer").val()});
            //Adiciona as restantes(erradas)
            $.each(nWrongAnswers, function (i, answer) {
                answers.push({_id: i + 1, content: $(answer).val()});
            });
            $("#inputAnswers").val(JSON.stringify(answers));
            //Se algum dos campos estiver vazio

            modem('PUT', 'questions/' + this.data._id,
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

        }

    },

    //Class Initializer
    initialize: function () {
    },

    afterRender: function () {
        var self = this;
        $("#selectAno").val(self.data.schoolYear)

    },

    //Class Renderer
    render: function () {
        var self = this;

        self.data = this.model.toJSON();
        $(self.el).html(self.template(self.data));
        getCategories(self.data.subject);

        return self;

    },

});
