// Teste:

var Test = Backbone.Model.extend({
    defaults: {},
    urlRoot: 'tests',
    initialize: function () {
    },
    fetch: function (after_fetch) {
        var self = this;

        modem('GET', 'tests/' + this.id,
            function (json) {
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
    assocTest: function (genericTest) {
        //Atribui ao teste nao-generico, os dados do teste generico(pai)
        this.urlRoot = "assocTest";
        this.set("questions", genericTest.questions)
        this.set("schoolYear", genericTest.schoolYear)
        this.set("subject", genericTest.subject)
        this.set("title", genericTest.title)
        this.save(null, {
            success: function (test, response) {
                $("#attrTest").modal("hide");
                sucssesMsg($("body"), response.result);
            },
            error: function (test, ajaxOptions, thrownError) {
                var json = JSON.parse(ajaxOptions.responseText);
                failMsg($("body"), json.result);
            },
        })
    }
});

var Tests = Backbone.Collection.extend({
    model: Test,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'tests',
            function (json) {
                for (i = 0; i < json.length; i++) {
                    self.models.push(new Test(json[i]));
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