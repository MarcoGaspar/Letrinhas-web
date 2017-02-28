window.QuestionsTouchNew = Backbone.View.extend({
    events: {
        "change #inputImage": "getImage",
        "mousemove": "getImagepoint",
        "click #follower": "setPoint"
    },

    getImage: function (e) {
        var fReader = new FileReader();
        fReader.readAsDataURL(e.currentTarget.files[0]);
        fReader.onloadend = function (event) {
            $("#imgTest").attr("src", event.target.result);
        }
        //Remove os circulos
        $(".cursorCircle").remove();
        $("#divPointsList div").remove();
    },
    getImagepoint: function (e) {

        var offset = $("#imgTest").offset();
        var relativeX = (e.pageX - offset.left);
        var relativeY = (e.pageY - offset.top);
        //Se estiver dentro dos limites da imagem
        if (relativeX >= 0 && relativeX < $("#imgTest").width() && relativeY >= 0 && relativeY < $("#imgTest").height()) {

            $("#lblX").text(relativeX + " | " + relativeY);

            var offsett = $(".container").offset();
            var relativeXt = (e.pageX - offsett.left) - 50 / 2;
            var relativeYt = (e.pageY - offsett.top) - 50 / 2;
            $("#follower").css({left: relativeXt, top: relativeYt, position: 'absolute'});
            $("#lblY").text(relativeXt + " | " + relativeYt);
        }

    },

    setPoint: function (e) {
        //Cria uma cor aleatoria
        var newColor = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);

        //obtem as coordenadas do click
        var offset = $(".container").offset();
        var relativeX = Math.round((e.pageX - offset.left) - 50);
        var relativeY = Math.round((e.pageY - offset.top) - 50);

        //Cria um novo circulo
        var $divCircle = $("<div>", {
            class: "cursorCircle",
            id: relativeX + ":" + relativeY
        });

        $divCircle.css({"border-color": newColor});
        $divCircle.css({left: relativeX, top: relativeY, position: 'absolute'});
        $(".container").append($divCircle);

        var growEl = $divCircle,
            curHeight = $divCircle.height() + relativeY / 2,
            curWidth = $divCircle.width();

        $divCircle.animate({
            height: 40 + "px",
            width: 40 + "px",
            top: relativeY + 50 - 20 + "px",
            left: relativeX + 50 - 20
        });
        var $inpt = $("<input>", {type: "text", class: "form-control"});
        $("#divPointsList").append(
            $("<div>", {class: "row input-group"}).append(
                $("<span>", {class: "input-group-addon btn-white"}).append(
                    $("<i>", {class: "fa fa-circle-thin", style: "color:" + newColor})
                ),
                $inpt
            ).click(
                function () {
                    $divCircle.addClass("sc");
                    setTimeout(function () {
                        $divCircle.removeClass("sc");
                    }, 1300);
                }
            )
        );

        $inpt.focus();
    },
    initialize: function () {

    }
    ,

    render: function () {
        $(this.el).html(this.template());


        return this;
    }
})
;