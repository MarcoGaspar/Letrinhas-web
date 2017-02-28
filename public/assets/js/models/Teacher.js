var Teacher = Backbone.Model.extend({
    urlRoot: 'teachers',
    defaults: {},
    initialize: function (options) {

    },
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'teachers/' + this.id,
            function (teacherData) {
                var classLength = 0;
                //If teacher exists
                if (teacherData) {
                    //Adiciona os dados ao model
                    self.attributes = (teacherData);
                    self.attributes.schools.sort(sortJsonByCol('id'));

                    //Conta o numero de turmas associadas
                    $.each(self.attributes.classes, function (i, classe) {
                        $.each(classe.class, function (ic, cl) {
                            classLength++;
                        })
                    })
                    self.set({classLength: classLength})
                } else {
                    self.set({id: null})
                }


                after_fetch();
            }, function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                failMsg($("body"), json.text);
                setTimeout(function () {
                    app.navigate('/user', {
                        trigger: true
                    });
                }, json.text.length * 50);
            });
    }
});

var Teachers = Backbone.Collection.extend({
    model: Teacher,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'teachers',
            function (json) {
                for (i = 0; i < json.length; i++) {
                    self.models.push(new Teacher(json[i].doc));
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