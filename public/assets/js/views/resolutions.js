window.ResolutionsView = Backbone.View.extend({
    events: {

        'click [type="checkbox"]': "filterBy",
        'mouseleave .listButton': "closeDD",
        "keyup #txtSearch": "filterBy"
    },
    //Quando a resolution perder o foco, fecha a dd
    closeDD: function (e) {
        $(".dropdown.open").removeClass("open");
    },
    //Applys filters
    filterBy: function () {
        var typedText = $("#txtSearch").val();

        //Esconde todos os testes
        $(".listButton").hide();
        //Mostra apenas os que contém a string escrita
        $(".listButton:containsi(" + typedText + ")").show();

        //Esconde os testes cujas checkboxes não estão seleccionadas
        $.each($("input:checkbox:not(:checked)"), function (i, k) {
            $(".listButton[type=" + $(k).attr("value") + "]").hide();
        });

        //Esconde os que ao correspondem conteudos seleccionados
        $.each($(".listButton:visible"), function (i, k) {
            //Se nao pertencerem à categoria escolhida, esconde-os
            if ($(k).attr("value").indexOf($("#filterSubject").attr("filter")) == -1) {
                $(k).hide();
            }
        });
        $("#questionsBadge").text($(".listButton:visible").length + "/" + this.data.length)
    },


    initialize: function () {
        var self = this;
        self.bd2 = 'let_resolutions';
        self.data = self.collection.toJSON();
    }
    ,


    //Class Renderer
    render: function () {

        var self = this;
        self.data.sort(sortJsonByCol('solved'));

        $(this.el).html(this.template({collection: self.data}));

        return this;

    }
});
