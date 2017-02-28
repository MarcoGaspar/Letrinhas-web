var Category = Backbone.Model.extend({
    urlRoot: 'categories',
    defaults: {},
    initialize: function () {
    },

    fetch: function (after_fetch) {
        var self = this;

        modem('GET', 'categories/' + this.id,
            //Response Handler
            function (json) {
                self.attributes = json;
                after_fetch();
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }
        );
    },
    insertCat: function (form) {
        var self = this;

        modem('POST', 'categories/' + form,
            //Response Handler
            function (json) {
                sucssesMsg($("body"), json.text);
                setTimeout(function () {
                    document.location.reload(true);
                }, json.text.length * 45);
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
            }, form
        );
    },
    insertSpecif: function (form, idCategory, idContent) {
        var self = this;

        modem('PUT', 'categories/' + idCategory + '/content/' + idContent + '/addSpecification',
            //Response Handler
            function (json) {
                sucssesMsg($("body"), json.text);
                setTimeout(function () {
                    document.location.reload(true);
                }, json.text.length * 45);
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
            }, form
        );
    },
    insertContent: function (form, idCategory) {
        var self = this;
        modem('PUT', 'categories/' + idCategory + '/addContent',
            //Response Handler
            function (json) {
                sucssesMsg($("body"), json.text);
                setTimeout(function () {
                    document.location.reload(true);
                }, json.text.length * 45);
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
            }, form
        );

    }
});

var Categories = Backbone.Collection.extend({
    model: Category,
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'categories',
            function (json) {
                //   json.sort(sortJsonByCol('id'));
                for (i = 0; i < json.length; i++) {

                    self.models.push(new Category(json[i].doc));
                }
                after_fetch();
            },
            function () {
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
    },

    removeSpecif: function (id, idSub, idSubSub) {
        var self = this;
        console.log(id);
        var fd = new FormData();
        fd.append("username", id);

        modem('DELETE', 'categories/'+id+'/content/'+idSub+'/specification/'+idSubSub,
        function (json) {
            sucssesMsg($("body"), json.text);
            setTimeout(function () {
                document.location.reload(true);
            }, json.text.length * 45);
        },
            //Precisamos enviar para a Tabela escolas o id do professor.
            function (xhr, ajaxOptions, thrownError) {

            },
              fd
        );




    }


});
