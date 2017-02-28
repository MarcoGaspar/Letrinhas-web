window.Developer = Backbone.View.extend({

    events: {
        "click #loginbtn": "attemptlogin",
        "click #showDownload": "showDownload",
        "click .btn-info": "appDownload",
    },


    //Show Login Modal
    attemptlogin: function (e) {
        var self = this;

        //Check For BasicAuth Session Cookie
        var keyo = window.sessionStorage.getItem("keyo");

        if (keyo) {
            app.navigate("/user", {
                trigger: true
            });
        }
        else {
            attemptLogin(function () {
                app.navigate("/user", {
                    trigger: true
                });
            });
        }
    },

    //Login Process
    login: function (e) {

        //Create Credentials
        var cre = $('#userEmail').val() + ':' + md5($("#psswrd").val());   //Credentials = Username:Password
        var creb = btoa(cre);                                         //Credentials Base64
        window.sessionStorage.setItem("keyo", creb);                  //Store Credentials Base64

        //Check User Authenticity
        modem('GET', 'me',

            //Response Handler
            function (json) {
                $("#mLogin").modal("hide");
                //If Session Already Present, Go to user main
                app.navigate("/user", {
                    trigger: true
                });
                //Show menus
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);

                //Remove Session Key if login atempt failed
                window.sessionStorage.removeItem("keyo");

                //Checks Error Type
                if (json.message.statusCode == 404) {
                }
                else {
                }

            }
        );

    },

    //Show App Download Modal
    showDownload: function (e) {
        var self = this;

        //Check For BasicAuth Session Cookie
        var keyo = window.sessionStorage.getItem("keyo");

        if (keyo) {
            $("#mApp").modal("show");
        }
        else {
            self.item = "app";
            $("#mLogin").modal("show");
        }

    },

    //Download App (This Doesn't Prevent File Download By Link Request)
    appDownload: function (e) {

        //Check User Authenticity
        modem('GET', 'me',

            //Response Handler
            function (json) {
                //Hide App Download Modal
                $("#mApp").modal("hide");
            },

            //Error Handling
            function (xhr, ajaxOptions, thrownError) {
                e.preventDefault();

                //Remove Session Key if login atempt failed
                window.sessionStorage.removeItem("keyo");

                //Hide App Download Modal
                $("#mApp").modal("hide");

            }
        );
    },

    //Class Initializer
    initialize: function () {

    },

    //Class Renderer
    render: function () {

        $(this.el).html(this.template());
        $(".card-grid", this.el).flip({trigger: 'hover'});
        $('.card-grid', this.el).css({'height': $('.card-grid').width() + 'px'});
        $('#fullpage', this.el).i18n();
        return this;
    }

});
