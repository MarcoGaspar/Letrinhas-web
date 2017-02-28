window.Home = Backbone.View.extend({

    events: {
        "click #loginbtn": "attemptlogin",
        "click #showDownload": "showDownload",
        "click .btn-info": "appDownload",
    },


    //Show Login Modal
    attemptlogin: function(e) {
        var self = this;

        attemptLogin(function() {
            document.location.reload(true);
            app.navigate("/user", {
                trigger: true
            });
        });

    },

    //Login Process
    login: function(e) {

        //Create Credentials
        var cre = $('#userEmail').val() + ':' + md5($("#psswrd").val()); //Credentials = Username:Password
        var creb = btoa(cre); //Credentials Base64
        window.sessionStorage.setItem("keyo", creb); //Store Credentials Base64

        //Check User Authenticity
        modem('GET', 'me',

            //Response Handler
            function(json) {
                $("#mLogin").modal("hide");
                //If Session Already Present, Go to user main
                app.navigate("/user", {
                    trigger: true
                });
                //Show menus
            },

            //Error Handling
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);

                //Remove Session Key if login atempt failed
                window.sessionStorage.removeItem("keyo");

                //Checks Error Type
                if (json.message.statusCode == 404) {} else {}

            }
        );

    },

    //Show App Download Modal
    showDownload: function(e) {
        var self = this;

        //Check For BasicAuth Session Cookie
        var keyo = window.sessionStorage.getItem("keyo");

        if (keyo) {
            $("#mApp").modal("show");
        } else {
            self.item = "app";
            $("#mLogin").modal("show");
        }

    },

    //Download App (This Doesn't Prevent File Download By Link Request)
    appDownload: function(e) {

        //Check User Authenticity
        modem('GET', 'me',

            //Response Handler
            function(json) {
                //Hide App Download Modal
                $("#mApp").modal("hide");
            },

            //Error Handling
            function(xhr, ajaxOptions, thrownError) {
                e.preventDefault();

                //Remove Session Key if login atempt failed
                window.sessionStorage.removeItem("keyo");

                //Hide App Download Modal
                $("#mApp").modal("hide");

            }
        );
    },

    //Class Initializer
    initialize: function() {




    },

    //Class Renderer
    render: function() {

        $(this.el).html(this.template());
        $('link[href="assets/css/styles.css"]').remove();




        $.templatemo_is_chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
        $.templatemo_is_ie = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
        $(window, this.el).scroll(function() {
            if ($(".navbar", this.el).offset().top > 50) {
                $(".navbar-fixed-top", this.el).addClass("top-nav-collapse");
            } else {
                $(".navbar-fixed-top", this.el).removeClass("top-nav-collapse");
            }
        });

        // Javascropt parallax effect config for different browser.
        // Chrome broswer setting
        if ($.templatemo_is_chrome) {




            $('#intro', this.el).parallax("100%", 0.1);
            $('#overview', this.el).parallax("100%", 0.3);
            $('#detail', this.el).parallax("100%", 0.2);
            $('#video', this.el).parallax("100%", 0.3);
            $('#speakers', this.el).parallax("100%", 0.1);
            $('#program', this.el).parallax("100%", 0.2);
            $('#register', this.el).parallax("100%", 0.1);
            $('#faq', this.el).parallax("100%", 0.3);
            $('#venue', this.el).parallax("100%", 0.1);
            $('#sponsors', this.el).parallax("100%", 0.3);
            $('#contact', this.el).parallax("100%", 0.2);

            // Non IE broswer setting

        } else if (!$.templatemo_is_ie) {


            $('#intro', this.el).parallax("100%", 0.1);
            $('#overview', this.el).parallax("100%", 0.3);
            $('#detail', this.el).parallax("100%", 0.2);
            $('#video', this.el).parallax("100%", 0.3);
            $('#speakers', this.el).parallax("100%", 0.1);
            $('#program', this.el).parallax("100%", 0.2);
            $('#register', this.el).parallax("100%", 0.1);
            $('#faq', this.el).parallax("100%", 0.3);
            $('#venue', this.el).parallax("100%", 0.1);
            $('#sponsors', this.el).parallax("100%", 0.3);
            $('#contact', this.el).parallax("100%", 0.2);
            // IE broswer setting

        } else {
            $('#intro', this.el).parallax("100%", 0.1);
            $('#overview', this.el).parallax("100%", 0.3);
            $('#detail', this.el).parallax("100%", 0.2);
            $('#video', this.el).parallax("100%", 0.3);
            $('#speakers', this.el).parallax("100%", 0.1);
            $('#program', this.el).parallax("100%", 0.2);
            $('#register', this.el).parallax("100%", 0.1);
            $('#faq', this.el).parallax("100%", 0.3);
            $('#venue', this.el).parallax("100%", 0.1);
            $('#sponsors', this.el).parallax("100%", 0.3);
            $('#contact', this.el).parallax("100%", 0.2);

        }

        return this;
    }



});
