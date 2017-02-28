var Me = Backbone.Model.extend({
    initialize: function () {

    },
    login: function (after_fetch) {
        var self = this;
        modem('GET', 'login', function (teacherData) {
            self.attributes = teacherData;
            self.set("permissionName", getUserRole(teacherData.permissionLevel));

            after_fetch();
        }, function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            failMsg($("body"), json.result);
            setTimeout(function () {
                app.navigate('/home', {
                    trigger: true
                });
            }, json.result.length * 50);
        });
    },
    fetch: function (after_fetch) {
        var self = this;
        modem('GET', 'me', function (teacherData) {
            self.attributes = teacherData;
            self.set("permissionName", getUserRole(teacherData.permissionLevel));

            after_fetch();
        }, function (xhr, ajaxOptions, thrownError) {
            /* var json = JSON.parse(xhr.responseText);
             failMsg($("body"), json.text);
             setTimeout(function () {
             app.navigate('/home', {
             trigger: true
             });
             }, json.text.length * 50);*/
        });
    }
});
