window.QuestionsWhiteSpacesNew = Backbone.View.extend({
    events: {
        "click #showEqualizer": "showEqualizer",
        "click #record": "initRecord",
        "change #uploadSoundFile": "uploadSoundFile",
        "click #markText": "markText",
        "click #writeText": "writeText",
        "click .selectable": "selectWord",
        "click #backbtn": "goBack",
        "blur .emptyField": "isEmpty",
        "mouseover #subTxt": "pop",
        "submit": "beforeSend"
    },
    //Initializes popover content
    pop: function () {
        setPopOver("Ano, Disciplina, Conteúdo, Especificação, Título, Pergunta, Texto");
    },

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Go back to the last visited page
    goBack: function (e) {
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
            $('#content').append(loadingSpinner());
            //Generate Form Data
            var fd = new FormData($("#newInterpretationTestForm")[0]);

            //Generate Answers Locations
            var $sid = [];
            //Recolhe os elementos seleccionados
            $.each($("#inputPanel").find(".whitespace"), function (iElem, elem) {
                $sid.push({id: $(elem).attr("id").substring(3), text: $(elem).html().trim()});
            });
            //Agrupa-os por texto
            $sid = _.chain($sid)
                .groupBy('text')
                .map(function (value, key) {
                    return {
                        text: key,
                        sids: _.pluck(value, 'id')
                    }
                })
                .value();
            fd.append("sid", JSON.stringify($sid));
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
                    var json = JSON.parse(xhr.responseText);
                    failMsg($("body"), "Não foi possível inserir a pergunta!");

                },
                fd
            );

        }


    },

    //Show Voice Recorder Equalizer
    showEqualizer: function (e) {
        e.preventDefault();
        $("#myModalRecord").modal("show");
        //Limpa a div
        $("#rTexto").empty();
        //Clona o texto
        $("#inputTextArea").clone().appendTo("#rTexto");

        initAudio();
    },

    //Initiate Voice Recording
    initRecord: function (e) {
        e.preventDefault();

        if ($("#record").attr("value") == 1) {
            $("#save").attr("style", "color:#80ccee;font-size:16px");
            $("#record").html('<span class="glyphicon glyphicon-record" style="color:#ee0000"></span> Gravar');
            $("#record").attr("value", 0);
        }
        else {
            $("#save").attr("style", "visibility:hidden");
            $("#record").html('<span class="glyphicon glyphicon-stop" style="color:#ee0000"></span> Parar');
            $("#record").attr("value", 1);
            $("#Rplayer").attr("style", "visibility:hidden;width:60%");
            $("#Rplayer").stop();
        }

        toggleRecording(e.target);
    },

    //Upload Sound File
    uploadSoundFile: function () {
        var files = $("#uploadSoundFile").prop('files');
        $("#soundPath")
            .attr("placeholder", files[0].name)
            .attr("value", files[0].name)
            .css('border', 'solid 1px #cccccc');
    },

    //Finalize Text Marking
    writeText: function (e) {
        e.preventDefault();

        $("#inputTextArea").show();
        $("#markText").show();

        $("#inputPanel").hide();
        $("#writeText").hide();

    },

    //Text Marking
    markText: function (e) {
        e.preventDefault();
        //Generate Answers Locations
        var $sid = [];
        $("#inputPanel").find(".whitespace").each(function () {
            $sid.push((this.id).substring(3));
        });
        var self = this;

        //Separa o texto em paragrafos
        var $paragraph = $("#inputTextArea").val().split(/\r|\n/);
        var words = $();
        var nWords = 0;

        //por cada paragrafo adiciona a palavra a lista, e a new line
        $.each($paragraph, function (iLine, line) {
            //Separa a pontuação
            var $wordsList = line.replace(/\,/gi, " ,").replace(/\-/gi, "- ").replace(/\:/gi, " :").replace(/\./gi, " .").replace(/\!/gi, " !").replace(/\?/gi, " ?").split(" ");
            $.each($wordsList, function (i, word) {
                if (word) {
                    //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                    words = words.add($('<span>', {
                        //Coloca um espaco a frente da palavra, se a segiur nao existir pontucao
                        text: word + ($wordsList[i + 1] == ',' ? '' : ' '),
                        id: 'sid' + nWords,
                        //Verifica se a palavra ja foi previamente seleccionada
                        class: "selectable " + (jQuery.inArray(nWords + "", $sid) != -1 ? 'whitespace' : '')
                    }))
                    //incrementa o nr de palavras (nao conta os breaks
                    nWords++;
                }
            });
            words = words.add('<br />')
        })
        $("#inputPanel").empty().append(words);

        $("#inputTextArea").hide();
        $("#markText").hide();

        $("#inputPanel").show();
        $("#writeText").show();
    },

    //Mark Word
    selectWord: function (e) {
        $(e.target).toggleClass("whitespace");
    },

    //Class Initializer
    initialize: function () {
    },

    //Class Renderer
    render: function () {
        var self = this;


        getCategories();
        $(this.el).html(this.template());
        return this;
    },

});
