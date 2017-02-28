var Question = Backbone.Model.extend({
    urlRoot: 'questions',
    defaults: {},
    initialize: function (options) {
        this.id = options.id;
        this.site = " http://letrinhas.ipt.pt/couchdb";
        this.bd = "let_questions";
    },

    fetch: function (after_fetch) {
        var self = this;

        modem('GET', 'questions/' + this.id,
            //Response Handler
            function (json) {
                self.attributes = json;
                self.set("voice", self.site + "/" + self.bd + "/" + json._id + "/voice.mp3");
                after_fetch();
            },

            //Error Handling
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

var Questions = Backbone.Collection.extend({
    model: Question,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'questions',
            function (json) {
                //   json.sort(sortJsonByCol('id'));
                for (i = 0; i < json.length; i++) {

                    self.models.push(new Question(json[i].doc));
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