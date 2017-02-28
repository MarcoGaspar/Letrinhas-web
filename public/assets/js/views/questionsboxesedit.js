window.QuestionsBoxesEdit = Backbone.View.extend({
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

            modem('PUT', 'questions/' + this.data._id,
                function () {
                    sucssesMsg($("body"), "Pergunta editada com sucesso!");
                    setTimeout(function () {
                        app.navigate("questions", {
                            trigger: true
                        });
                    }, 1500);
                },
                //Error Handling
                function (xhr, ajaxOptions, thrownError) {
                    failMsg($("body"), "Não foi possível editar a pergunta.");
                },
                new FormData($("#newBoxesTestForm")[0])
            );

        }
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

    }

});
