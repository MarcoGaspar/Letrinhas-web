window.TestsView = Backbone.View.extend({
    events: {
        'click .previewTest': "fillPreview",
        'click .cloneTest': "cloneTest",
        'click .assocTeste': "assocTeste",
        'click #btnAtrTest': "atrTeste",
        "click .newTest": "newTest",
        'click .contentFilter': "filterBySubject",
        "keyup #txtSearch": "filterByText",
        "click .deleteTest": "confirmDelete",
        "click #deletebtn": "deleteTest",

    },

    newTest: function (e) {
        e.preventDefault();
        app.navigate('tests/new', true);
    },

    cloneTest: function (e) {
        e.preventDefault();
        var id =$(e.currentTarget).attr('value');
        app.navigate('testsClone/'+id, true);
    },

    //Applys filters
    filterBy: function () {
        $("#nodata").remove();
        //Esconde todos os alunos
        $(".testItem").show();

        var self = this;
        $(".testItem:not(:containsi('" + self.filters.text + "'))").hide();
        $(".testItem:not(:containsi('" + self.filters.sub + "'))").hide();

        //verifica o tipo

        var nQuest = $(".testItem:visible").length;
        $("#counter").html(nQuest + "/" + this.data.length);
        if (!nQuest) {
            $(".content-wrapper").append(
                $('<span>', {
                    id: 'nodata',
                    html: 'UPS! Não encontrámos testes que correspondam aos filtros seleccionados. \n'
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

    //Exibe o modal com os campos necessarios para associar o teste
    assocTeste: function (e) {
        console.log('attr')
        //Mostra o titulo do teste
        $("#attrTest h4").html("Atribuir teste: " + $(e.currentTarget).attr("testName"));
        $("#testID").val($(e.currentTarget).attr("testID"))
        // $("#testsPreview").clone().appendTo(".modal-body");
        //$("#mLogin  #myCarousel").attr("id", "atrTest");
        // $("#mLogin  a").attr("href", "#atrTest");
        $("#attrTest").modal("show");
    },

    //Atribui o teste ao aluno
    atrTeste: function (e) {
        e.preventDefault();

        //Se algum dos campos estiver vazio
        var allListElements = $(".mandatory");
        //Verifies if all inputs are OK
        var isValid = isFormValid(allListElements);
        if (isValid) {

            var testDetails = $('#attrTestForm').serializeObject();
            //Obtem os dados to teste generico
            var genericTest = this.collection.getByID(testDetails.genericID);
            //Cria um novo model com os dados do teste generico e os dados especificos
            var assocTest = new Test(testDetails)
            //envia o post
            assocTest.assocTest(genericTest);
        }
    },

    orderTests: function (e) {
        var mylist = $('#testsContent');

        orderContentList(mylist, e);
    },

    fillPreview: function (e) {

        var testID = $(e.currentTarget).attr("id");
        //Se ainda nao foi preenchido
        if ($(e.currentTarget).attr('filled') == 'false') {
            var self = this;
            //Recolhe a info do teste
            var test = this.collection.getByID(testID);

            //Recolhe a info de cada uma das perguntas do teste
            $("#mvCrsl" + testID + " .carousel-indicators").empty();
            $("#mvCrsl" + testID + " .carousel-inner").empty();
            $.each(test.questions, function (testKey, quest) {

                //Adiciona o botao
                $("#mvCrsl" + testID + " .carousel-indicators").append($('<li>', {
                    'data-target': "#mvCrsl" + testID,
                    'data-slide-to': testKey
                }));


                var question = new Question({id: quest._id});
                question.fetch(function () {
                    //Adiciona o titulo
                    //Adiciona a div onde será apresentado o conteúdo
                    $("#mvCrsl" + testID + " .carousel-inner").append($('<div>', {
                        class: 'item', html: quest.title, id: 'questionsPreview' + (testKey + '').concat(testID)
                    }));
                    //Exibe os dados do teste
                    self.enchePreview(question.attributes, (testKey + '').concat(testID));
                    //Exibe a primeira pergunta do teste
                    $("#mvCrsl" + testID + ' .carousel-indicators li:first').addClass('active');
                    $("#mvCrsl" + testID + ' .carousel-inner > div:first').addClass('active');
                })

            });
            $(e.currentTarget).attr('filled', 'true')
        }


    },

    //Text Preview
    enchePreview: function (question, i) {
        //gets model info
        var self = this;
        //Clear Preview
        $("#questionsPreview" + i).empty();

        //Question Description
        $("#questionsPreview" + i)
            .append(
                $('<label>', {
                    class: "dataTitle col-md-12 row", text: question.title
                }).append("<hr>"),
                $('<div>', {
                    class: "form-group"
                }),
                $('<div>', {
                    class: "form-group"
                }).append(
                    $('<label>', {
                        class: "col-md-3 lblDataDetails", text: "Pergunta:"
                    }),
                    $('<label>', {
                        class: "col-md-9 ", text: question.question
                    })
                ),

                $('<div>', {
                    class: "col-md-12", id: "questionBox" + i
                })
            )
        ;

        switch (question.type) {
            case 'text':
                $("#questionsPreview" + i).append(getTextPreview(question))
                break;
            case 'list':
                $("#questionsPreview" + i).append(setListPreview(question))
                break;
            case 'interpretation':
                $("#questionsPreview" + i).append(setInterpretationPreview(question))
                break;
            case 'multimedia':
                $("#questionsPreview" + i).append(setMultimediaPreview(question))
                break;
            case 'boxes':
                $("#questionsPreview" + i).append(setBoxesPreview(question))
                break;
            case 'whitespaces':
                $("#questionsPreview" + i).append(setWhiteSpacesPreview(question))
                break;
        }
        ;
    },

    //Solicita confirmação para apagar o teste
    confirmDelete: function (e) {
        console.log(id);
        var id = $(e.currentTarget).attr("testID");
        var nome = $(e.currentTarget).attr("testName");
        console.log(id);
        var modal = delModal("Apagar professor",
            "Tem a certeza que pretende eliminar o teste <label>" + nome + " </label> ?",
            "deletebtn", id);

        $('.translations').append(modal);
        $('#modalConfirmDel').modal("show");
    },


    deleteTest: function (e) {
        var self = this;
        $('#modalConfirmDel').modal("hide");
        //Apaga o professor seleccionado

        var test = new Test({id: e.target.value})

        test.destroy({
            success: function () {
                sucssesMsg($("#testsDiv"), "Teste apagado com sucesso!");
                setTimeout(function () {
                    document.location.reload(true);
                }, 2000);
            },
            error: function () {
                failMsg($("#testsDiv"), "Lamentamos mas não foi possível eliminar o teste!", 1000);
            }
        });


    },

    //Class Initializer
    initialize: function () {

        this.data = this.collection.toJSON();
        this.bd2 = 'let_questions';
        this.site = 'http://letrinhas.ipt.pt/couchdb';//process.env.COUCHDB;
        getStudents();
        getTypes();

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

        //Check Local Auth
        self.filters = {sub: '', text: ''};
        self.setSideMenu();
        self.data.sort(sortJsonByCol('title'));

        $(this.el).html(this.template({collection: self.data}));
        $('.translations', this.el).i18n();
        return this;
    }

});
