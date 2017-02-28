window.QuestionsListEdit = Backbone.View.extend({
    events: {
        "click #showEqualizer": "showEqualizer",
        "click #record": "initRecord",
        "change #uploadSoundFile": "uploadSoundFile",
        "click #backbtn": "goBack",
        "blur .emptyField": "isEmpty",
        "mouseover #subTxt": "pop",
        "submit": "beforeSend",

        "blur .list": "applyText",
        "click .soundAdjust": "adjustSound",
        "click .next": "nextStep",
        "click .previous": "previousStep",
        "click #wordsList .selectable": "addTiming",
        'click .jumpToWord': 'jumpToWord',
        'click .adjustBack': 'adjustBack',
        'click .adjustFront': 'adjustFront',
        'click .removeTime': 'removeTime',

    },


    //MARKED WORDS BUTTONS
    jumpToWord: function (e) {
        //Procura os dados da palavra e reproduz
        var x = document.getElementById("teacherVoice1");
        x.currentTime = $(e.currentTarget).closest('.word').attr('data-start');
        x.play();
    },
    adjustBack: function (e) {
        var $word = $(e.currentTarget).closest('.word');
        $word.attr('data-start', ( parseFloat($word.attr('data-start')) - (0.1)).toFixed(3))
    },
    adjustFront: function (e) {
        var $word = $(e.currentTarget).closest('.word');
        $word.attr('data-start', ( parseFloat($word.attr('data-start')) + (0.1)).toFixed(3))
    },
    removeTime: function (e) {
        var $word = $(e.currentTarget).closest('.word');
        $word.children('div').remove();
        $word.removeClass('word')
        $word.removeClass('selected')
        $word.removeAttr('data-start')

    },

    //MARK WORDs
    addTiming: function (e) {
        //Se a palavra nao estiver marcada ainda
        if (!$(e.currentTarget).hasClass('word')) {
            var x = document.getElementById("teacherVoice1");
            var pop = Popcorn("#teacherVoice1");
            $(e.target).attr('data-start', (x.currentTime - 0.3).toFixed(3))
            $(e.target).addClass('word');
            $(e.target).append(
                '<div class="wordOptions">' +
                '<div class="input-group-addon"><i class="fa fa-backward adjustBack"></i></div>' +
                '<div class="input-group-addon"><i class="fa fa-play-circle-o jumpToWord"></i></div>' +
                '<div class="input-group-addon"><i class="fa fa-forward adjustFront"></i></div>' +
                '<div class="input-group-addon"><i class="fa fa-close removeTime"></i></div>' +

                '</div>'
            )
            pop.footnote({
                start: $(e.target).attr('data-start'),
                text: '',
                target: $(e.target).attr('id'),
                effect: "applyclass",
                applyclass: "selected"
            });
            pop.play();
        }
        // this.applyTimings();
    },
    adjustSound: function (e) {
        e.preventDefault();

        var x = document.getElementById("teacherVoice1");
        x.playbackRate = (x.playbackRate + (0.1 * $(e.target).val())).toFixed(1);
        $("#soundSpeed").html(x.playbackRate * 100 + '%');
    },

    //PREVIOUS--NEXT CONTROLS
    previousStep: function (e) {
        e.preventDefault();
        var prevId = $(e.currentTarget).parents('.tab-pane').prev().attr("id");
        $('[href="#' + prevId + '"]').tab('show');
    },
    nextStep: function (e) {
        e.preventDefault();
        var $parentTab = $(e.currentTarget).parents('.tab-pane');
        //If all mandatory inputs are filled, goes to next tab
        if (this.validateDetails($parentTab.attr("id"))) {

            var nextId = $parentTab.next().attr("id");
            $('[href="#' + nextId + '"]').tab('show');
        }
    },
    //Validates first TAB
    validateDetails: function (parentID) {
        //Se algum dos campos estiver vazio
        var allListElements = $('#' + parentID + ' .mandatory');
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        return isValid;
    },
    applyText: function (e) {

        //Clona o texto
        $.each($("#lists textarea"), function (iList, list) {
            $("#wordsList #list" + (iList + 1)).empty();
            var words = $();
            var word = $(list).val().split('\n');
            for (var nWords = 0; nWords < word.length; nWords++) {
                $("#wordsList #list" + (iList + 1)).append($('<span>', {
                    text: word[nWords],
                    id: "wd" + nWords,
                    class: 'selectable'

                }), '<br>')
            }

        })

    },

    //Initializes popover content
    pop: function () {

        setPopOver("Ano, Disciplina, Conteúdo, Especificação, Título, Pergunta, Coluna");

    },

    //Go back to the last visited page
    goBack: function (e) {
        e.preventDefault();
        window.history.back();
    },

    //Verifies if an input is empty
    isEmpty: function (e) {
        if ($(e.currentTarget).val().length != 0) {
            $(e.currentTarget).removeClass("emptyField");
        }
    },

    //Before Sending Request To Server
    beforeSend: function (e) {
        e.preventDefault();
        var $wordTimes = [];
        $.each($(".selectable.word"), function (i, word) {
            $wordTimes.push({pos: $(word).attr('id').replace('wd', ''), start: $(word).attr('data-start')})
        });
        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        var fd = new FormData($("#newListTestForm")[0])
        fd.append("wordTimes", JSON.stringify($wordTimes))
        if (isValid) {
            //Recolhe as listas
            var wordsLists = $(".list");
            var lists = [];
            //Adiciona as listas que estivrem preenchidas
            $.each(wordsLists, function (i, list) {
                //Se a coluna não estiver vazia, separa as palavras para um array
                if ($(list).val()) {
                    lists.push({words: $(list).val().replace(/\n/g, " ").split(" ")});
                }
            });
            fd.append("columns", JSON.stringify(lists))
            $('#content').append(loadingSpinner());
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
        $("#lists").clone().appendTo("#rTexto");

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
        var reader = new FileReader();
        var sound = document.getElementById('teacherVoice');
        reader.onload = (function (audio) {
            return function (e) {
                audio.src = e.target.result;
            };
        })(sound);
        reader.readAsDataURL(files[0]);

        $("#soundPath")
            .attr("placeholder", files[0].name)
            .attr("value", files[0].name)
            .css('border', 'solid 1px #cccccc');
        $("#teacherVoice source").attr("src", files[0].name);
        var mySnd = document.getElementById("teacherVoice");
        //mySnd.playbackRate = 0.5;
    },


    //Class Initializer
    initialize: function () {
    },

    afterRender: function () {
        var self = this;
        //seleecciona o ano escolar
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
