Backbone.View.prototype.close = function () {
    this.remove();
    this.unbind();
    this.undelegateEvents();
};

Backbone.ajax = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0].beforeSend = function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + (window.sessionStorage.getItem("keyo") || (window.localStorage.getItem("keyo") )));
    };

    return Backbone.$.ajax.apply(Backbone.$, args);
};

var Router = Backbone.Router.extend({
    currentView: undefined,
    showView: function (view, elem, sub) {
        elem.show();
        if (sub == false) {
            if (this.currentView)
                this.currentView.close();
            this.currentView = view;
            this.currentView.delegateEvents();

        }
        var rendered = view.render();
        elem.html(rendered.el);
    },
    afterRender: function (view) {
        view.afterRender();
    },
    routes: {

        //Pagina Inicial
        "home": "home",
        "dev": "developer",
        "categories": "categories",
        //Teachers Routing
        "teachers": "teachers",
        "teachers/new": "teachersNew",
        "teachers/:id/edit": "teachersEdit",
        "user": "user",

        //School Routing
        "schools": "schools",
        "schools/new": "schoolsNew",
        "schools/:id/edit": "schoolsEdit",

        //Students Routing
        "students": "students",
        "students/new": "studentsNew",
        "students/:id/edit": "studentsEdit",
        "students/:id/info": "studentsInfo",

        "statistics": "statistics",

        //Touch questions Routing
        "questionsTouch": "questionsTouch",
        "questionsTouch/new": "questionsTouchNew",
        "questionsTouch/edit": "questionsTouchEdit",

        "resolutions": "resolutions",
        "resolutions/:id": "resolutionsNew",

        //Tests Routing
        "questions": "questions",

        // TESTE DE TEXT
        "questionsText/new": "questionsTextNew",
        "questionstext/:id/edit": "questionsTextEdit",
        "questionstext/:id/clone": "questionsTextClone",

        // TESTE DE LIST
        "questionslist/new": "questionslistNew",
        "questionslist/:id/edit": "questionsListEdit",
        "questionslist/:id/clone": "questionsListClone",

        // TESTE DE MULTIMEDIA
        "multimediaTest/new": "multimediaTestNew",
        "questionsmultimedia/:id/edit": "questionsMultimediaEdit",
        "questionsmultimedia/:id/clone": "questionsMultimediaClone",

        // TESTE DE INTERPRETATION
        "interpretationTest/new": "interpretationTestNew",
        "questionsinterpretation/:id/edit": "questionsInterpretationsEdit",
        "questionsinterpretation/:id/clone": "questionsInterpretationsClone",

        // TESTE DE BOXES
        "questionsBoxes/new": "questionsBoxesNew",
        "questionsboxes/:id/edit": "questionsBoxesEdit",
        "questionsboxes/:id/clone": "questionsBoxesClone",



        "whitespaces/new": "questionsWhiteSpacesNew",
        "connections/new": "connectionsNew",

        "tests": "tests",
        "tests/new": "testsNew",

        "testsClone/:id" :"testsClone",

        //Default Page
        "": "index"
    },


    //Load NavigationBar
    navbar: function () {
        var self = this;
        $('#content').html(loadingSpinner());
        templateLoader.load(["NavigationBarView"],
            function () {
                var ss = new Me();
                ss.login(function () {
                    var v = new NavigationBarView({
                        model: ss
                    });
                    self.showView(v, $('#header'));
                })

            }
        );

    },


    //Default Template
    index: function () {
        app.navigate("/home", {
            trigger: true
        });
    },


    //Inic Template
    home: function () {
        var self = this;

        $('#header').html("");
        $('#content').html("");

        templateLoader.load(["Home"],
            function () {
                var v = new Home({});
                self.showView(v, $('#content'));
            }
        );
    },
    //Inic Template

    developer: function () {
        var self = this;

        templateLoader.load(["Developer"],
            function () {
                var v = new Developer({});
                self.showView(v, $('#content'));
            }
        );
    },

    //Teacher Templates
    categories: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["CategoriesView"],
            function () {
                var ss = new Categories();
                ss.fetch(function () {
                    var v = new CategoriesView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },


    //Home Template
    resolutions: function () {
        var self = this;

        this.navbar();

        templateLoader.load(["ResolutionsView"],
            function () {
                var ss = new Resolutions();
                ss.fetch(function () {
                    var v = new ResolutionsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    resolutionsNew: function (id) {
        var self = this;

        this.navbar();

        templateLoader.load(["ResolutionsNewView"],
            function () {
                var ss = new Resolution({id: id});
                ss.fetch(function () {
                    var v = new ResolutionsNewView({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v)
                });
            }
        );
    },
    //Teacher Templates
    teachers: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["TeachersView"],
            function () {
                var ss = new Teachers();
                ss.fetch(function () {
                    var v = new TeachersView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    teachersNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["TeachersNewView"],
            function () {
                var v = new TeachersNewView({});
                self.showView(v, $('#content'));
            }
        );
    },

    teachersEdit: function (id) {
        var self = this;

        self.navbar();
        templateLoader.load(["TeachersEditView"],
            function () {
                var ss = new Teacher({
                    id: id
                });
                ss.fetch(function () {
                    var v = new TeachersEditView({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                })

            }
        );

    },

    user: function () {
        var self = this;
        self.navbar();

        templateLoader.load(["UserView"],
            function () {
                var ss = new Me({});
                ss.fetch(function () {
                    var v = new UserView({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                })

            }
        );
    },

    //Student Templates
    students: function () {
        var self = this;

        self.navbar();
        templateLoader.load(["StudentsView"],
            function () {
                var ss = new Students();
                ss.fetch(function () {
                    var v = new StudentsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );

    },

    studentsNew: function () {
        var self = this;

        this.navbar();

        templateLoader.load(["StudentsNewView"],
            function () {
                var v = new StudentsNewView({});
                self.showView(v, $('#content'));
            }
        );
    },

    studentsEdit: function (id) {
        var self = this;

        this.navbar();
        templateLoader.load(["StudentsEdit"],
            function () {
                var ss = new Student({
                    id: id
                });
                ss.fetch(function () {
                    var v = new StudentsEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                })

            }
        );
    },
    studentsInfo: function (id) {
        var self = this;

        this.navbar();
        templateLoader.load(["StudentsInfo"],
            function () {
                var ss = new Student({
                    id: id
                });
                ss.fetchDetails(function () {
                    var v = new StudentsInfo({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v);
                })

            }
        );
    },

    //School Templates
    schools: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["SchoolsView"],
            function () {
                var ss = new Schools();
                ss.fetch(function () {
                    var v = new SchoolsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    schoolsNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["SchoolsNew"],
            function () {
                var v = new SchoolsNew({});
                self.showView(v, $('#content'));
            }
        );
    },

    schoolsEdit: function (id) {
        var self = this;

        this.navbar();

        templateLoader.load(["SchoolsEdit"],
            function () {
                var ss = new School({
                    id: id
                });
                ss.fetch(function () {
                    var v = new SchoolsEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                })

            }
        );
    },

    statistics: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["StatisticsView"],
            function () {
                var ss = new Statistics();
                ss.fetch(function () {
                    var v = new StatisticsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    //Questions template
    questionsTouch: function () {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsTouch"],
            function () {
                var v = new QuestionsTouch({});
                self.showView(v, $('#content'));
            }
        );
    },

    questionsTouchNew: function () {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsTouchNew"],
            function () {
                var v = new QuestionsTouchNew({});
                self.showView(v, $('#content'));
            }
        );
    },

    questionsTouchEdit: function () {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsTouchEdit"],
            function () {
                var v = new QuestionsTouchEdit({});
                self.showView(v, $('#content'));
            }
        );
    },

    //Tests Templates
    questions: function () {
        var self = this;

        self.navbar();
        templateLoader.load(["QuestionsView"],
            function () {
                var ss = new Questions();
                ss.fetch(function () {
                    var v = new QuestionsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    questionsTextNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsTextNew"],
            function () {
                var v = new QuestionsTextNew({});
                self.showView(v, $('#content'));
            }
        );
    },
    questionsTextEdit: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsTextEdit"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsTextEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },

    questionsTextClone: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsTextClone"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsTextClone({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },


    multimediaTestNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsMultimediaNew"],
            function () {
                var v = new QuestionsMultimediaNew({});
                self.showView(v, $('#content'));
            }
        );
    },
    questionsMultimediaEdit: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsMultimediaEdit"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsMultimediaEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },


    questionsMultimediaClone: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsMultimediaClone"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsMultimediaClone({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },

    connectionsNew: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsConnectionsNew"],
            function () {
                var v = new QuestionsConnectionsNew({});
                self.showView(v, $('#content'));
            }
        );
    },


    questionslistNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsListNew"],
            function () {
                var v = new QuestionsListNew({});
                self.showView(v, $('#content'));
            }
        );
    },
    questionsListEdit: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsListEdit"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsListEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },

    questionsListClone: function (id) {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsListClone"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsListClone({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })

            }
        );
    },

    interpretationTestNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsInterpNew"],
            function () {
                var v = new QuestionsInterpNew({});
                self.showView(v, $('#content'));
            }
        );
    },

    questionsInterpretationsEdit: function (id) {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsInterpEdit"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsInterpEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })
            }
        );
    },
    questionsInterpretationsClone: function (id) {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsInterpClone"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsInterpClone({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })
            }
        );
    },

    questionsBoxesNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsBoxesNew"],
            function () {
                var v = new QuestionsBoxesNew({});
                self.showView(v, $('#content'));
            }
        );
    },

    questionsBoxesEdit: function (id) {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsBoxesEdit"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsBoxesEdit({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })
            }
        );
    },

    questionsBoxesClone: function (id) {
        var self = this;
        self.navbar();
        templateLoader.load(["QuestionsBoxesClone"],
            function () {
                var ss = new Question({
                    id: id
                });
                ss.fetch(function () {
                    var v = new QuestionsBoxesClone({
                        model: ss
                    });
                    self.showView(v, $('#content'));
                    self.afterRender(v, $('#content'))
                })
            }
        );
    },

    questionsWhiteSpacesNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["QuestionsWhiteSpacesNew"],
            function () {
                var v = new QuestionsWhiteSpacesNew({});
                self.showView(v, $('#content'));
            }
        );
    },
    tests: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["TestsView"],
            function () {
                var ss = new Tests();
                ss.fetch(function () {
                    var v = new TestsView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

    testsClone: function (id) {
      var self = this;

      self.navbar();

      templateLoader.load(["TestsCloneView"],
          function () {
              var ss = new Test({id:id});
              console.log(id);
              console.log(ss);
              console.log('----------------');
              ss.fetch(function () {
                  var v = new TestsCloneView({
                      model: ss
                  });
                  self.showView(v, $('#content'));
              })
          }
      );
  },


    testsNew: function () {
        var self = this;

        self.navbar();

        templateLoader.load(["TestsNewView"],
            function () {
                var ss = new Questions();
                ss.fetch(function () {
                    var v = new TestsNewView({
                        collection: ss
                    });
                    self.showView(v, $('#content'));
                })
            }
        );
    },

});


$(document).ready(function () {
    var language = localStorage.getItem('language');
    if (language === null) {
        language = 'pt-PT';
        localStorage.setItem('language', 'pt-PT');
    }

    $.i18n.init({
        lng: language,
        ns: {
            namespaces: ['ns.common'],
            defaultNs: 'ns.common'
        },
        useLocalStorage: false,
        useCookie: false
    }, function (t) {
        templateLoader.load(["Home"],
            function () {
                app = new Router();
                Backbone.history.start();
            }
        );
    });
});
