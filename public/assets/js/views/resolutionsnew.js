window.ResolutionsNewView = Backbone.View.extend({
    events: {

        'click [type="checkbox"]': "filterBy",
        'click .subError': 'saveError',
        'change input': 'afterRender',
        'change select': 'recalcTestNote',
        'click .questBox > span': "resolWord",
        'click #subCorrection': "subCorrection",
        'mouseleave .listButton': "closeDD"
    },


    subCorrection: function (e) {
        e.preventDefault();
        var resolution = new Resolution();
        resolution.attributes.questions = [];
        //Recolhe cada um dos forms
        $.each($('form'), function (iForm, form) {
            var formData = $(form).serializeObject();
            var nAccuracy = 0;
            formData.id = $(form).attr("id");
            formData.type = $(form).attr("type");

            //Recolhe os erros dos tipos de texto e lista
            if (formData.type == "list" || formData.type == "text") {
                formData.errors = [];
                //recolhe os erros
                var errors = $("#" + formData.id + " *[class*='fluidity'],#" + formData.id + " [class*='accuracy'] ");
                $.each(errors, function (iErr, err) {
                    var wordIndex = $(err).attr("id").replace("wd", '');
                    var error = $(err).attr("class").split(":");
                    formData.errors.push({
                        index: wordIndex,
                        error: error[0],
                        subError: error[1]
                    })
                })
                //Recolhe o nr de palavras e as palavras/min
                formData.wordsCount = $("#" + formData.id + " #wordsCount").html();
                formData.wordsMin = $("#" + formData.id + " #wordsMin").html();
            }
            //Diferencia o teste das perguntas
            if (formData.type == "test") {
                resolution.attributes.test = (formData);
            } else {
                resolution.attributes.questions.push(formData);
            }

        });
        //Verifica se todos os testes estao corrigidos
        var corrected = true;
        $.each(resolution.attributes.questions, function (iRes, res) {
            if (res.type == 'text' || res.type == 'list') {
                if (res.note == '0') {
                    corrected = false;
                }
            }
        });
        //se todas estiverem corrigidas
        if (corrected) {
            resolution.save(null, {
                success: function (user, response) {
                    sucssesMsg($(".form"), response.text);
                    setTimeout(function () {
                        app.navigate("resolutions", {
                            trigger: true
                        });
                    }, 1500);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(ajaxOptions.responseText);
                    failMsg($("body"), json.text);
                }
            })
        } else {
            failMsg($("body"), "Existem perguntas por corrigir. Verifique para continuar.");
        }

    },
    //Calcula a nota do teste de texto/lista segundo os parametros seleccionados
    recalcTestNote: function (e) {
        var self = this;
        //obtem o respectivo form
        var formName = $(e.currentTarget).closest('form').attr("id");
        //Numero total de palavras
        var nWords = parseInt($("#" + formName + " #wordsCount").html());

        //Total dos parametros de dificuldade
        var difTotal = 0;

        //nota final
        var finalNote = 0;

        //Calcula o subtotal da precisao
        var accuracyError = parseInt($("#" + formName + " #accuracy").val());
        var accuracyNote = (100 - (accuracyError * 100 / nWords)) * 5 / 100 * parseInt($("#" + formName + " #accuracyDif").val());
        if ($.isNumeric(accuracyNote)) {
            difTotal += parseInt($("#" + formName + " #accuracyDif").val());
            finalNote += accuracyNote;
        }

        //Calcula o subtotal da fluidez
        var fluidityError = parseInt($("#" + formName + " #fluidity").val());
        var fluidityNote = (100 - (fluidityError * 100 / nWords)) * 5 / 100 * parseInt($("#" + formName + " #fluidityDif").val());
        if ($.isNumeric(fluidityNote)) {
            difTotal += parseInt($("#" + formName + " #fluidityDif").val());
            finalNote += fluidityNote;
        }

        //Calcula o subtotal da pontuacao
        var expressionNote = (parseInt($("#" + formName + " #expression").val()) * parseInt($("#" + formName + " #expressionDif").val()));
        if ($.isNumeric(expressionNote)) {
            difTotal += parseInt($("#" + formName + " #expressionDif").val());
            finalNote += expressionNote;
        }
        //Calcula o subtotal do tempo (tempo do prof/tempo do aluno)
        var timeNote = (parseInt($("#" + formName + " #time").val()) * parseInt($("#" + formName + " #timeDif").val()));
        if ($.isNumeric(timeNote)) {
            difTotal += parseInt($("#" + formName + " #timeDif").val());
            finalNote += timeNote;
        }
        //Passa para percentagem
        finalNote = ((finalNote / difTotal) * 100 / 5) || 0;

        //Coloca a nota final no input
        $("#" + formName + " input[name='note']").val(finalNote);
        self.afterRender();
    },
    //Regista os erros das palavras
    saveError: function (e) {

        // var minutes = Math.floor(studentDuration / 60);


        var self = this;
        //obtem o erro erro:suberro
        var err = $(e.currentTarget).attr("err");

        //obtem o respectivo form
        var formName = $(e.currentTarget).closest('form').attr("id");

        /*
         //Obtem as palavras/min do aluno
         var studentDuration = $("#" + formName + " #studentsVoice")[0].duration;
         //Numero total de palavras
         var nWords = parseInt($("#" + formName + " #wordsCount").html());
         $("#" + formName + " #wordsMin").html(parseInt(nWords / (studentDuration / 60)));
         */

        //incrementa o total de erros

        $("#correctionDD").addClass(err)

        //Recalcula  a nota
        var accuracyError = $("#" + formName + " *[class*='accuracy']").length;
        var fluidityError = $("#" + formName + " *[class*='fluidity']").length;

        $("#" + formName + " #errorCount").html(fluidityError + accuracyError);
        $("#" + formName + " #fluidity").val(fluidityError);
        $("#" + formName + " #accuracy").val(accuracyError);

        self.recalcTestNote(e);

        $("#correctionDD").removeClass(err)


        //substitui a dd exixtente novamento pelo span e adiciona o erro
        $("#correctionDD").replaceWith($('<span>', {
            html: $("#correctionDD").attr('word'),
            id: $("#correctionDD").attr('wordId'),
            class: err,
        }));
        //Volta o som 3 seg atras e continua a reproducao

        var audio = $("#" + formName + " #studentsVoice")
        audio.get(0).currentTime -= 3;
        audio.get(0).play();
    },

    resolWord: function (e) {

        //pausa o audio
        $("audio").trigger('pause');

        var $target = $(e.currentTarget);

        //TRoca o span pela dd dos erros
        $(e.currentTarget).replaceWith(showCorrectionDD($target.html(), $target.attr('id')))


    },

    initialize: function () {
        var self = this;
        self.bd2 = 'let_resolutions';

    },
    initialize: function () {
        var self = this;
        self.bd2 = 'let_resolutions';

    }    ,

    afterRender: function () {
        var self = this;
        //Coloca as notas dos testes automaticos nas tabelas
        var $notes = $("input[name='note']");
        var totalNote = 0;
        var totalDif = 0;
        //Recolhe as notas e a dificuldade de cada teste
        $.each($notes, function (iNote, note) {
            var questNote = parseFloat($(note).val());
            var questDif = parseInt($(note).attr("dif"));
            //Coloca o valor na tabela
            $("#finalNote" + $(note).attr("questionID")).html(questNote)
            totalNote += questNote * questDif;

            totalDif += questDif;
        });
        //Calcula a nota final do teste
        $("#testNote").val((totalNote / totalDif).toFixed(2))
    },
//Class Renderer
    render: function () {

        var self = this;

//conta o numero de palavras
        self.data = self.model.toJSON();
        $(this.el).html(this.template({model: self.data}));
        //console.log("já render")

        return this;

    }
});
