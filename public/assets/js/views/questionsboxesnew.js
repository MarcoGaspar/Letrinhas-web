window.QuestionsBoxesNew = Backbone.View.extend({
    events: {
        "click #backbtn": "goBack",
        "blur .emptyField": "isEmpty",
        "mouseover #subTxt": "pop",
        "submit": "beforeSend"
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
        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        //If they are
        if (isValid) {
            //Recolhe as listas
            var wordsLists = $(".list");
            var boxes = [];
            //Adiciona as caixas

            boxes.push({name: $("#boxTitle0").val(), words: $("#box0").val().replace(/\n/g, " ").split(" ")});
            boxes.push({name: $("#boxTitle1").val(), words: $("#box1").val().replace(/\n/g, " ").split(" ")});

            $("#boxes").val(JSON.stringify(boxes));

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
                new FormData($("#newBoxesTestForm")[0])
            );

        }
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
