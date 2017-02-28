var School = Backbone.Model.extend({
    urlRoot: 'schools',
    defaults: {},
    initialize: function (options) {

    },
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'schools/' + this.id,
            function (json) {
                //Adiciona os dados ao model
                self.attributes = (json);
                //Ordena as classes por ano
                self.attributes.classes.sort(sortJsonByCol('name'));
                self.attributes.classes.sort(sortJsonByCol('year'));
                after_fetch();
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
            }
        );
    }
});

var Schools = Backbone.Collection.extend({
    model: School,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'schools',
            function (json) {
                for (i = 0; i < json.length; i++) {
                    self.models.push(new School(json[i].doc));
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