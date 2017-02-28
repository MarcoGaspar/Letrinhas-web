var Student = Backbone.Model.extend({
    urlRoot: 'students',
    defaults: {},
    initialize: function (options) {

    },
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'students/' + this.id,
            function (json) {
                self.attributes = (json);
                after_fetch();
            },
            function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                failMsg($("body"), json.text);
                setTimeout(function () {
                    app.navigate('/home', {
                        trigger: true
                    });
                }, json.text.length * 50);
            }
        );
    },
    fetchDetails: function (after_fetch) {
        var self = this;
        modem('GET', 'students/' + this.id + '/info',
            function (json) {

                $.each(json.resolutions, function (iResol, resol) {
                    //Obtem apenas a disciplina
                    resol.subject = resol.subject.split(":")[0];
                    //Obtem apenas a data

                });
                self.attributes = (json);
                after_fetch();
            },
            function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                failMsg($("body"), json.text);
                setTimeout(function () {
                    app.navigate('/user', {
                        trigger: true
                    });
                }, json.text.length * 50);
            }
        );
    },
    exist: function (username, after_fetch) {
        var self = this;
        //Generate Form Data
        var fd = new FormData();
        //puts username fields
        fd.append("username", username);
        //sends id
        modem('POST', 'students/exist',
            function (response) {
                after_fetch(response);
            },
            //Precisamos enviar para a Tabela escolas o id do professor.
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
});

var Students = Backbone.Collection.extend({
    model: Student,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'students',
            function (json) {
                json.sort(sortJsonByCol('name'));
                for (i = 0; i < json.length; i++) {
                    self.models.push(new Student(json[i]));

                }
                after_fetch();
            },
            function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                failMsg($("body"), json.text);
                setTimeout(function () {
                    app.navigate('/user', {
                        trigger: true
                    });
                }, json.text.length * 50);
            }
        );
    },
    //Gets specific item from collection
    getByID: function (id) {
        var self = this;
        return (
            self.models.find(function (model) {
                return model.get('_id') === id;
            }).attributes
        )
    }
});