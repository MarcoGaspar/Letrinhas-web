window.QuestionsInterpEdit = Backbone.View.extend({
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
            //Generate Form Data
            var fd = new FormData($("#newInterpretationTestForm")[0]);

            //Generate Answers Locations
            var $sid = [];
            $("#inputPanel").find(".badge").each(function () {
                $sid.push((this.id).substring(3));
            });
            fd.append("sid", $sid);
            $('#content').append(loadingSpinner());
            modem('PUT', 'questions/' + this.data._id,
                function (json) {
                    sucssesMsg($("body"), "Pergunta editada com sucesso!");
                    setTimeout(function () {
                        app.navigate("questions", {
                            trigger: true
                        });
                    }, 1500);

                },
                //Error Handling
                function (xhr, ajaxOptions, thrownError) {

                    var json = JSON.parse(xhr.responseText);
                    failMsg($("body"), json.text);
                    setTimeout(function () {
                        app.navigate('/user', {
                            trigger: true
                        });
                    }, json.text.length * 50);
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
        $("#inputPanel").find(".badge").each(function () {
            $sid.push((this.id).substring(3));
        });
        var self = this;

        //Separa o texto em paragrafos
        var $paragraph = $("#inputTextArea").val().split(/\r|\n/);
        var words = $();
        var nWords = 0;
        //por cada paragrafo adiciona a palavra a lista, e a new line
        $.each($paragraph, function (iLine, line) {
            var $wordsList = line.split(" ");
            $.each($wordsList, function (i, word) {
                //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                words = words.add($('<span>', {
                    text: word + " ",
                    id: 'sid' + nWords,
                    //Verifica se a palavra ja foi previamente seleccionada
                    class: "selectable " + (jQuery.inArray(nWords + "", $sid) != -1 ? 'badge' : '')
                }))
                //incrementa o nr de palavras (nao conta os breaks
                nWords++;
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
        $(e.target).toggleClass("badge");
    },

    //Make Unique String Array
    unique: function (list) {
        var result = [];
        $.each(list, function (i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    },


    //Class Initializer
    initialize: function () {
    },
    afterRender: function () {
        var self = this;

        //seleecciona o ano escolar
        $("#selectAno").val(self.data.schoolYear)

        //Marca o texto

        var $sid = self.data.content.sid;

        //Separa o texto em paragrafos
        var $paragraph = $("#inputTextArea").val().split(/\r|\n/);
        var words = $();
        var nWords = 0;
        //por cada paragrafo adiciona a palavra a lista, e a new line
        $.each($paragraph, function (iLine, line) {
            var $wordsList = line.split(" ");
            $.each($wordsList, function (i, word) {
                //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                words = words.add($('<span>', {
                    text: word + " ",
                    id: 'sid' + nWords,
                    //Verifica se a palavra ja foi previamente seleccionada
                    class: "selectable " + (jQuery.inArray(nWords + "", $sid) != -1 ? 'badge' : '')
                }))
                //incrementa o nr de palavras (nao conta os breaks
                nWords++;
            });
            words = words.add('<br />')
        })
        $("#inputPanel").empty().append(words);

        $("#inputTextArea").hide();
        $("#markText").hide();

        $("#inputPanel").show();
        $("#writeText").show();

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
