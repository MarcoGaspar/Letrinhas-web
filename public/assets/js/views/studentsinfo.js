window.StudentsInfo = Backbone.View.extend({
    events: {},

    //Class Initializer
    initialize: function (id) {
        var self = this;
        self.data = this.model.toJSON();

    },
    afterRender: function () {
        window.graph = [];
        //sets graph by subject
        //lista de testes agrupados por disciplina
        var groupByTest = _.groupBy(this.data.resolutions, 'subject');


        //MEDIA
        var noteSum = 0;
        var noteAvrg = 0;
        //calcula a media nao poderada das perguntas agrupadas por disciplina
        $.each(groupByTest, function (iDisc, disc) {
            noteSum = 0;
            noteAvrg = 0;
            //por cada pergunta
            $.each(disc, function (iQuest, quest) {
                noteSum += parseFloat(quest.note);
            });
            noteAvrg = ( noteSum / disc.length).toFixed(2);
        });

        //Por cada disciplina, cria um novo grafico
        for (var desc in groupByTest) {
            $("#subjectGraphs").append($('<div>', {class: "box box-default"}).append(
                $('<div>', {class: "box-header with-border"}).append(
                    $('<h3>', {class: "box-title"}).append(
                        $('<img>', {src: "img/" + desc + ".png", style: "display: block; height:20px"})
                    )
                ),
                $('<div>', {class: "box-body", style: "display: block; height:250px", id: "QC" + desc}).append(

                )
            ))
            setQuestionsChart(groupByTest[desc], "QC" + desc);
        }
//MEDIA

        //grupo de testes so de leitura
        var groupByReading = _.filter(this.data.resolutions, function (test) {
            return test.type == 'text' || test.type == 'list';
        });
        //agrupa os testes de leitura por disciplina
        groupByReading = _.groupBy(groupByReading, 'subject');
        for (var desc in groupByReading) {
            $("#readingGraphs").append($('<div>', {class: "box box-default"}).append(
                $('<div>', {class: "box-header with-border"}).append(
                    $('<h3>', {class: "box-title"}).append(
                        $('<img>', {src: "img/" + desc + ".png", style: "display: block; height:20px"})
                    )
                ),
                $('<div>', {class: "box-body", style: "display: block; height:250px", id: "RC" + desc}).append(

                )
            ))
            console.log("RC" + desc)
            setReadingChart(groupByReading[desc], "RC" + desc);
        }

    },
    render: function () {
        var self = this;
        $(this.el).html(this.template(self.data));

        $('.form', this.el).i18n();

        return this;
    }

});
