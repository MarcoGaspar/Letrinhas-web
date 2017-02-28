window.QuestionsView = Backbone.View.extend({
    events: {
        "click #deletebtn": "deleteQuestion",
        "click #deleteQuest": "confirmDelete",
        "click .editQuestion": "editQuestion",
        "click .cloneQuestion": "cloneQuestion",
        'click .contentFilter': "filterBySubject",
        "keyup #txtSearch": "filterByText",
        'click .word': 'jumpToWord',
        'click [type="checkbox"]': "filterByType",
    },
    jumpToWord: function (e) {
        //Procura os dados da palavra e reproduz
        var id = $(e.target).closest('.questionItem').attr('id');
        var x = document.getElementById("teacherVoice" + id);
        x.currentTime = $(e.currentTarget).attr('data-start');
        x.play();
    },

    cloneQuestion: function (e) {
        e.preventDefault();
        console.log(e.target.value);


        app.navigate(e.target.value, {
            trigger: true
        });

    },

    //Solicita confirmação para apagar o professor
    confirmDelete: function (e) {

        console.log(e.currentTarget);

        var id = $(e.currentTarget).attr("value");
        var title = $(e.currentTarget).attr("name");
        console.log(e.currentTarget);
        console.log('id: ' + id);
        console.log('title: ' + title  );

        var modal = delModal("Apagar pergunta",
            "Tem a certeza que pretende eliminar a pergunta <label>" + title + " </label> ?",
            "deletebtn", id);


        $('#questionsDiv').append(modal);
        $('#modalConfirmDel').modal("show");
    },

    //Remove School
    deleteQuestion: function (e) {
        //e.preventDefault();
        console.log('value:  ' + e.target.value);
        $('#modalConfirmDel').modal("hide");
        var question = new Question({id: e.target.value})
        console.log('aquii');
        console.log(question);
        question.destroy({
            success: function (user, response) {
                sucssesMsg($("body"), response.result);
                setTimeout(function () {
                    document.location.reload(true);
                }, 2000);
            },
            error: function (test, ajaxOptions, thrownError) {
                var json = JSON.parse(ajaxOptions.responseText);
                failMsg($("body"), json.result);
            }
        });
    },
    editQuestion: function (e) {
        e.preventDefault();
        console.log(e.target.value);
        app.navigate(e.target.value, {
            trigger: true
        });
    },

    //Applys filters
    filterBy: function () {
        $("#nodata").remove();
        //Esconde todos os alunos
        $(".questionItem").show();

        var self = this;
        $(".questionItem:not(:containsi('" + self.filters.text + "'))").hide();
        $(".questionItem:not(:containsi('" + self.filters.sub + "'))").hide();

        //verifica o tipo

        if (self.filters.type.length != 0) {
            $.each($(".questionItem:visible"), function (i, k) {
                if (self.filters.type.indexOf($(k).attr('type')) == -1) {
                    $(k).hide();
                }
            });
        }
        var nQuest = $(".questionItem:visible").length;
        $("#counter").html(nQuest + "/" + this.data.length);
        if (!nQuest) {
            $(".content-wrapper").append(
                $('<span>', {
                    id: 'nodata',
                    html: 'UPS! Não encontramos perguntas que correspondam aos filtros seleccionados. \n'
                })
            )
        }
    },

    filterBySubject: function (e) {
        e.preventDefault();
        var self = this;
        self.filters.sub = $(e.currentTarget).attr('value');
        self.filterBy();
    },


    filterByText: function (e) {
        var self = this;
        self.filters.text = $(e.currentTarget).val();
        self.filterBy();
    },

    filterByType: function (e) {
        var self = this;
        self.filters.type = [];
        $.each($("input:checkbox:checked"), function (i, k) {
            self.filters.type.push($(k).attr("value"))
        });
        self.filterBy();
    },
    //Class Initializer
    initialize: function () {
        var self = this;
        self.bd2 = 'let_questions';
        self.site = 'http://letrinhas.ipt.pt:85';//process.env.COUCHDB;
        self.data = self.collection.toJSON();
    },

    setSideMenu: function () {
        var self = this;
        var cats = new Categories();
        cats.fetch(function () {
            var categories = cats.toJSON();
            for (var i = 0; i < categories.length; i++) {
                var $contents = $('<ul>', {class: "treeview-menu", style: "display: none;"});
                $contents.append(
                    $('<li>').append(
                        $('<a>', {href: "#", class: "contentFilter", value: categories[i]._id}).append(
                            $('<i>', {
                                class: "fa fa-circle-o text-aqua"
                            }),
                            'All'
                        )
                    )
                )
                for (var sub = 0; sub < categories[i].content.length; sub++) {

                    var $spec = $('<ul>', {class: "treeview-menu", style: "display: none;"});
                    $spec.append(
                        $('<li>').append(
                            $('<a>', {
                                href: "#",
                                class: "contentFilter",
                                value: categories[i].content[sub]._id
                            }).append(
                                $('<i>', {
                                    class: "fa fa-circle-o text-aqua"
                                }),
                                'All'
                            )
                        )
                    )
                    for (var spec = 0; spec < categories[i].content[sub].specification.length; spec++) {

                        $('.sidebar-menu', self.el).append(
                            $spec.append(
                                $('<li>').append(
                                    $('<a>', {
                                        href: "#",
                                        class: "contentFilter",
                                        value: categories[i].content[sub].specification[spec]._id
                                    }).append(
                                        $('<i>', {
                                            class: "fa fa-circle-o text-aqua"
                                        }),
                                        categories[i].content[sub].specification[spec].name
                                    )
                                )
                            )
                        )
                    }
                    $('.sidebar-menu', self.el).append(
                        $contents.append(
                            $('<li>').append(
                                $('<a>', {href: "#"}).append(
                                    $('<i>', {
                                        class: "fa fa-circle-o text-orange"
                                    }), categories[i].content[sub].name
                                    , $('<span>', {class: 'pull-right-container'}).append(
                                        $('<i>', {class: "fa fa-angle-left pull-right"})
                                    )
                                ),
                                $spec
                            )
                        )
                    )
                }
                $('.sidebar-menu', self.el).append(
                    $('<li>', {class: "treeview"}).append(
                        $('<a>', {href: '#'}).append(
                            $('<img>', {src: " img/" + categories[i]._id + ".png"}),
                            $('<span>', {html: categories[i].subject}),
                            $('<span>', {class: 'pull-right-container'}).append(
                                $('<i>', {class: "fa fa-angle-left pull-right"})
                            )
                        ),

                        $contents
                    )
                )
            }
        })
    },

    //Class Renderer
    render: function () {
        var self = this;
        self.filters = {sub: '', type: [], text: ''};
        self.setSideMenu();

        self.data.sort(sortJsonByCol('title'));

        $(self.el).html(self.template({collection: self.data}));
        $('.translations', this.el).i18n();

        return self;
    }
})
;
