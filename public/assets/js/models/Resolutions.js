var Resolution = Backbone.Model.extend({
        urlRoot: 'resolutions',
        defaults: {},
        initialize: function () {
            this.site = "http://letrinhas.ipt.pt:85";
        },
        fetch: function (after_fetch) {
            var self = this;
            modem('GET', 'resolutions/' + this.id,
                function (json) {
                    self.attributes = (json);
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
    })
    ;

var Resolutions = Backbone.Collection.extend({
    model: Resolution,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'resolutions',
            function (json) {
                for (i = 0; i < json.length; i++) {
                    if (json[i].resolutionDate) {
                        var date = new Date(json[i].resolutionDate);
                        json[i].resolutionDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
                    }

                    self.models.push(new Resolution(json[i]));
                }
                //Separa os resolvidos dos nao resolvidos
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