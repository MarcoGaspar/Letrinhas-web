/**
 * Created by Cris on 17/03/2016.
 */
/*

 $("<div>", { class: "col-md-8 col-sm-8" }
 */


/*
 modem('GET', 'me',

 //Response Handler
 function (json) {
 $.each(json, function (i, key) {
 });


 },

 //Error Handling
 function (xhr, ajaxOptions, thrownError) {
 }
 );




 */
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


//Faz shuffle das posicoes dos elementos Dom
//https://css-tricks.com/snippets/jquery/shuffle-dom-elements/
(function ($) {

    $.fn.shuffle = function () {

        var allElems = this.get(),
            getRandom = function (max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function () {
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
            });

        this.each(function (i) {
            $(this).replaceWith($(shuffled[i]));
        });

        return $(shuffled);

    };

})(jQuery);

window.orderContentList = function (mylist, e) {
    var listitems = mylist.children('div').get();

    listitems.sort(function (a, b) {
        return $(a).find('span').text().toUpperCase().localeCompare($(b).find('span').text().toUpperCase());
    });
    //ordenar de forma descendente/ascendente
    if (!$(e.currentTarget).children('span').hasClass("fa-sort-alpha-asc")) {
        listitems = listitems.reverse();
        $(e.currentTarget).children('span').addClass("fa-sort-alpha-asc")
        $(e.currentTarget).children('span').removeClass("fa-sort-alpha-desc")
    } else {
        $(e.currentTarget).children('span').removeClass("fa-sort-alpha-asc")
        $(e.currentTarget).children('span').addClass("fa-sort-alpha-desc")
    }
    $.each(listitems, function (index, item) {
        mylist.append(item);
    });
};
//Populates schools and classes dropdowns ( for edit and new teacher)
window.populateDDSchools = function (school, classe) {

    var ss = new Schools();
    ss.fetch(function () {
        $("#dbSchools").append('<option disabled selected>Escola</option>');

        $("#dbClasses").append('<option disabled selected>Turma</option>');
        //Lista as escolas
        for (i = 0; i < ss.models.length; i++) {
            var obj = ss.models[i].attributes;
            $("#dbSchools").append('<option value="' + obj._id + '">' + obj.name + '</option>');
        }
        $("#dbSchools").append("</select>");
        $("#dbClasses").append("</select>");

        //Ao alterar a dd das escolas, altera a dd das turmas
        $('#dbSchools').change(
            function () {
                var selectedSchool = $("#dbSchools").val();
                $("#dbClasses").empty();
                for (i = 0; i < ss.models.length; i++) {
                    var obj = ss.models[i].attributes;
                    if (obj._id === selectedSchool) {
                        $("#dbClasses").append('<option disabled selected>Turma</option>');
                        for (j = 0; j < obj.classes.length; j++) {
                            $("#dbClasses").append('<option value="' + obj.classes[j]._id + '">' + obj.classes[j].year + 'º' + obj.classes[j].name + '</option>');
                        }
                    }
                }
                $("#dbClasses").append("</select>");
            }
        );

        //Selecciona a escola passada por parametro
        if (school) {
            $("#dbSchools").val(school)
            $("#dbSchools").change();
            $("#dbClasses").val(classe)
        }

    });
};

window.assocClass = function () {
    var escola = $("#dbSchools option:selected").val();
    var turma = $("#dbClasses option:selected").val();
    if (escola != undefined && turma != undefined) {
        var obj = jQuery.parseJSON($("#teacherClasses").val());
        //Se a escola já estiver listada, e a turma não, adiciona a turma
        if (obj[escola]) {
            if (obj[escola].classes.indexOf(turma) == -1) {
                obj[escola].classes.push(turma);
            } else {
                return false;
            }
        } else {
            obj[escola] = {};
            obj[escola]['id'] = escola;
            obj[escola].classes = [];
            obj[escola].classes.push(turma);
        }
        $("#teacherClasses").val(JSON.stringify(obj));
        $("#assocTurma").append(
            $('<div>', {class: "row"}).append(
                $('<p>', {
                    class: "col-md-10 col-sm-10",
                    html: $("#dbSchools option[value=" + $("#dbSchools").val() + "]").text() + ',  <b>' + $("#dbClasses option[value=" + $("#dbClasses").val() + "]").text() + '</b>'
                }),
                $('<div>', {class: "col-md-2 col-sm-2"}).append(
                    $('<button>', {
                        class: "deleteClass round-button fa fa-trash",
                        id: escola + ':' + turma
                    })
                )
            )
        )
        $("#schoolsNewBadge").html(parseInt($("#schoolsNewBadge").html()) + 1)
    }
};

window.removeClass = function (elem) {
    var classe = (elem.id).split(":");
    modem('POST', 'teachers/' + $("#inputEmail").val() + '/removeFromClass',
        //Response Handler
        function (json) {
            getAssocClasses($("#inputEmail").val(), $("#InputNome").val(), true);
        },
        //Error Handling
        function (xhr, ajaxOptions, thrownError) {
            failMsg($("#newteacherform"), "Não foi possível alterar os dados. \n (" + JSON.parse(xhr.responseText).result + ").");
        },
        '&school=' + encodeURIComponent(classe[0]) + '&class=' + encodeURIComponent(classe[1])
    )
    ;
};

window.desassocClass = function (elem) {
    var obj = jQuery.parseJSON($("#teacherClasses").val());
    var data = elem.id.split(":");
    //Remove a turma da lista
    $.each(obj, function (iSchool, school) {
        if (school.id == data[0]) {
            $.each(school.classes, function (iTurma, turma) {
                if (turma == data[1]) {
                    obj[iSchool].classes.splice(iTurma, 1);
                    if (school.classes.length == 0) {
                        delete obj[iSchool];
                    }
                }
            })
        }
    });
//Remove a entrada
    $(elem).parent().parent().remove();
    $("#teacherClasses").val(JSON.stringify(obj));
    $("#schoolsNewBadge").html(parseInt($("#schoolsNewBadge").html()) - 1)
};

//Return a String identifier of a level
window.getUserRole = function (permissionLevel) {
    switch (permissionLevel) {
        case 1 :
            return "Auxiliar";
            break;
        case 2 :
            return "Professor";
            break;
        case 3 :
            return "Administrador de Sistema";
            break;
        default:
            return "Utilizador";
    }
};

window.getCategories = function (cat) {

    //Gets all registed categories
    modem('GET', 'categories',
        //Response Handler
        function (json) {
            $.each(json, function (i, key) {
                $("#selectSubject").append($("<option>", {html: key.doc.subject, value: key.doc._id}));
            });

            //Populates dd with the contents of selects subject
            $('#selectSubject').change(
                function () {
                    $.each(json, function (i, key) {
                        var selectedSubject = $("#selectSubject").val();
                        if (key.doc._id === selectedSubject) {
                            //Limpa a dd
                            $("#selectContent").html("");
                            $("#selectContent").append('<option value="" disabled selected>Conteúdo</option>');
                            $("#selectSpecification").append('<option value="" disabled selected>Especificação</option>');
                            $.each(key.doc.content, function (id, content) {
                                $("#selectContent").append($("<option>", {
                                    html: content.name,
                                    id: content._id,
                                    value: content._id
                                }));
                            });
                        }
                    });
                }
            )//Populates dd with the contents of selects subject
             //Populates dd with the contents of selects subject
            $('#selectContent').change(
                function () {
                    $.each(json, function (i, key) {
                        var selectedSubject = $("#selectSubject").val();
                        var selectedContent = $("#selectContent").val();
                        if (key.doc._id === selectedSubject) {
                            //Limpa a dd
                            $("#selectSpecification").html("");
                            $("#selectSpecification").append('<option disabled value="" selected>Especificação</option>');

                            $.each(key.doc.content, function (id, content) {
                                if (content._id === selectedContent) {
                                    $.each(content.specification, function (ids, specif) {
                                        $("#selectSpecification").append($("<option>", {
                                            html: specif.name,
                                            id: specif._id,
                                            value: specif._id
                                        }));
                                    });
                                }
                            });
                        }
                    });
                }
            )
            //Selecciona a categoria passada por parametro
            if (cat) {
                cat = cat.split(":");
                $("#selectSubject").val(cat[0])
                $("#selectSubject").change();
                $("#selectContent").val(cat[1])
                $("#selectContent").change();
                $("#selectSpecification").val(cat[2])
            }

        },

        //Error Handling
        function (xhr, ajaxOptions, thrownError) {
        }
    );

};


//Gets categories filters to questions and tests
window.getFilters = function () {
    var categories = new Categories();
    categories.fetch(
        //Response Handler
        function () {
            categories.each(function (item) {
                var $content = $("<ul >", {class: "dropdown-menu pull-right"});

                $("#filterSubject").append(
                    $("<li>", {class: "dropdown-submenu pull-left"}).append(
                        $("<a>", {
                            class: "dropdown-toggle contentFilter",
                            "data-toggle": "dropdown",
                            html: item.get("subject"),
                            style: "color: #1fb5ad;",
                            value: item.get("_id")
                        }).append(
                            $("<b >", {class: "caret"})
                        ),
                        $content
                    )
                );
                $.each(item.get("content"), function (idc, content) {
                    var $description = $("<ul >", {class: "dropdown-menu pull-right"});
                    $content.append(
                        $("<li>", {class: "dropdown-submenu pull-left"}).append(
                            $("<a>", {
                                class: "dropdown-toggle contentFilter",
                                style: "color: #fac7da;",
                                html: content.name,
                                value: content._id
                            }).append(
                                $("<b >", {class: "caret"})
                            ),
                            $description
                        )
                    );
                    $.each(content.specification, function (ids, specif) {

                        $description.append(
                            $("<li>", {class: "dropdown-submenu pull-left"}).append(
                                $("<a>", {
                                    class: "contentFilter",
                                    "data-toggle": "dropdown",
                                    style: "color: #8BC34A;",
                                    html: specif.name,
                                    value: specif._id
                                })
                            )
                        );

                    });
                });

            });
        }
    );
};

//Gets test types
window.getTypes = function () {
    modem('GET', 'testTypes',
        function (json) {
            //ordena por value
            json.sort(sortJsonByCol('value'));
            $.each(json, function (id, type) {
                $("#selectType").append($("<option>", {
                    html: "(" + type.value + ") " + type.description,
                    id: type._id,
                    value: type.value,
                }));
            });
        },
        function () {
        }
    );
};
//Gets list of students to dd
window.getStudents = function () {

    var ss = new Students();
    ss.fetch(function () {
        $.each(ss.models, function (i, student) {
            $("#studentsDD").append($("<option>", {
                html: student.attributes.name,
                value: student.attributes._id,
            }));
        });

    })

};
//dovolve uma dd com a importancia da question
window.getImportanceDD = function () {
    var $imp = $('<select>', {
        id: 'selectImportance', class: "form-control",
        style: "width: 200px;display:inline-table;"
    });
    var importances = [];
    importances.push({value: 1, description: "Trivial"});
    importances.push({value: 2, description: "Fácil"});
    importances.push({value: 3, description: "Médio"});
    importances.push({value: 4, description: "Difícil"});
    importances.push({value: 5, description: "Muito difícil"});
    $imp.append($("<option>", {
        html: "Dificuldade"
    }));
    $.each(importances, function (iImportance, importance) {

        $imp.append($("<option>", {
            html: "(" + importance.value + ") " + importance.description,
            value: importance.value,
        }));
    });
    $imp.val(3)
    return $imp;
};


//Devolve os tipos de perguntas existentes
window.questionTypes = function () {
    var questionTypes = [];
    questionTypes.push({type: "text", description: "Texto"});
    questionTypes.push({type: "multimedia", description: "Multimédia"});
    questionTypes.push({type: "list", description: "Lista"});
    questionTypes.push({type: "interpretation", description: "Interpretação"});
    questionTypes.push({type: "whitespaces", description: "Espaços"});
    questionTypes.push({type: "connections", description: "Ligações"});
    questionTypes.push({type: "regions", description: "Regiões"});
    questionTypes.push({type: "boxes", description: "Caixas"});
    return questionTypes;
};


window.setPopOver = function (campos) {
    $('#infoPop').popover({
        placement: 'left',
        toggle: 'popover',
        trigger: "hover",
        content: '<i class="fa fa-square-o"></i>' +
        " Todos os campos são de preenchimento obrigatório. <br />" +
        "(" + campos + ")",
        html: true
    });
};

//Checks if all form inputs are OK
window.isFormValid = function (elementsList) {
    var isValid = true;
    $.each(elementsList, function (key, elem) {

        if (!$(elem).val()) {
            //Se for o b64, muda a border do pai
            if ($(elem).is("[type=hidden]")) {
                $(elem).parent().addClass("emptyField");
            }
            //Se o elemento for um select
            if ($(elem).is("select")) {
                // $(elem).parent().addClass("emptyField");
                $(elem).addClass("emptyField");

            }
            $(elem).addClass("emptyField");
            isValid = false;
            $("#infoPop").css("color", "#c9302c");
            $('#infoPop').popover("show");
            setTimeout(function () {
                $('#infoPop').popover("hide");
            }, 1500);
            isValid = false;
        } else {
            $(elem).removeClass("emptyField");
        }
    });
    return isValid;
}

//Checks if an element is ok
window.isElemValid = function (elem) {
    if ($(elem).val()) {
        //Se for o b64, muda a border do pai
        if ($(elem).is("[type=hidden]")) {
            $(elem).parent().removeClass("emptyField");
            return;
        }
        //Se o elemento for um select
        if ($(elem).is("select")) {
            $(elem).parent().removeClass("emptyField");
            $(elem).removeClass("emptyField");
            return;
        }
        $(elem).removeClass("emptyField");

    }
}

//Aperfeiçoamente da funcao ":contains" do JQuery para case insensitive
//(http://stackoverflow.com/questions/187537/is-there-a-case-insensitive-jquery-contains-selector)
$.extend($.expr[':'], {
    'containsi': function (elem, i, match, array) {
        return (elem.textContent || elem.innerText || '').toLowerCase()
                .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});
//Verifica se as duas Strings são iguais
window.matchingPswds = function (password, confPassword) {
    if (password == confPassword) {
        return true;
    }
    else {
        return false;

    }
};


/********************************************************************************LOGIN***************/

window.isLogged = function () {
    if (!window.sessionStorage.getItem("keyo") && !window.localStorage.getItem("keyo")) {
        showLoginModal($("body"))
        return false;
    }
};
//Mostra o formulário de login no form indicado
window.showLoginModal = function (form) {

    var $loginModal = $("<div>", {
            class: "modal fade", tabindex: "-1", id: "mLogin", role: "dialog",
            "aria-labelledby": "myModalLabel", "aria-hidden": "true"
        }).append(
        $("<div>", {class: "modal-dialog"}).append(
            $("<div>", {class: "modal-content"}
                // MODAl HEATHER
            ).append(
                $("<div>", {class: "modal-header"}).append(
                    $("<button>", {
                        type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"
                    }),
                    $("<h3>", {
                        class: "modal-title", text: "Controlo de acesso"
                    })
                )
                // MODAl HEATHER
            ).append(
                $("<div>", {
                    class: "modal-body",
                }).append(
                    $("<div>", {
                        class: "row form-group",
                    }).append(
                        $("<div>", {
                            class: "col-sm-12",
                        }).append(
                            $("<input>", {
                                id: "userEmail", class: "form-control", placeholder: "E-mail", name: "email",
                                type: "email", autofocus: "autofocus", autocomplete: "on"
                            })
                        ).append($("<span>", {
                            id: "imgMail", class: "glyphicon glyphicon-envelope"
                        }))
                    ),
                    $("<div>", {
                        class: "row form-group",
                    }).append(
                        $("<div>", {
                            class: " col-sm-12",
                        }).append(
                            $("<input>", {
                                id: "psswrd",
                                class: "form-control",
                                placeholder: "Palavra-passe",
                                name: "password",
                                type: "password"
                            })
                        ).append($("<span>", {
                            id: "pwdIcon", class: "glyphicon glyphicon-lock"
                        }))
                    )/*,
                     $("<div>", {
                     class: "row form-group",
                     }).append(
                     $("<div>", {
                     class: " col-sm-12 checkbox",
                     }).append(
                     $("<label>", {
                     html: "Manter sessão iniciada"
                     }).append($("<input>", {
                     type: "checkbox",
                     value: '',
                     id: 'keepsession'
                     })))
                     )*/
                )
            ).append(
                $("<div>", {
                    class: "modal-footer",
                }).append(
                    $("<button>", {
                        type: "submit", id: "loginbtn", class: "btn btn-lg btn-login btn-block",
                        text: "Entrar",
                        onClick: "attemptLogin()"
                    })
                )
            )
        ))
        ;
    $(form).append($loginModal);

    $("#mLogin").modal({backdrop: 'static', keyboard: true});
    $("#mLogin").modal("show");
};

//Tenta efectuar login
window.attemptLogin = function (callback) {
    //Create Credentials
    var cre = $('#userEmail').val() + ':' + md5($("#psswrd").val());   //Credentials = Username:Password
    if ($("#keepsession").prop("checked")) {
        window.localStorage.setItem("keyo", btoa(cre));                  //Store Credentials Base64
    } else {
        window.sessionStorage.setItem("keyo", btoa(cre));                  //Store Credentials Base64
    }

    //Check User Authenticity
    modem('GET', 'me',

        //Response Handler
        function (user) {
            //Se a opçao manter sessao iniciada estiver 'ligada'
            if ($("#keepsession").prop("checked")) {
                window.localStorage.setItem("user", user._id)
            } else {
                window.sessionStorage.setItem("user", user._id)
            }

            callback();

        },
        //Error Handling
        function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            failMsg($('body'), json + '')
        }
    );
};


//efectua logout
window.logout = function () {
    window.sessionStorage.clear();
    window.localStorage.clear();
    app.navigate("/home", {
        trigger: true
    });
};

/********************************************************************************CROPPER***************/
//showCropper("nomeFormulario/div", maxWidth da tela, Width do resultado, height do resultado , ratio (1=quadrado) (16/9=rectangulo);
window.showCropper = function (form, base_image, resWidth, aspectRatio, result) {
    //Se a imagem for verticalmente maior
    if (base_image.width < base_image.height) {
        var maxHeight = 300;
        var maxWidth = base_image.width * maxHeight / base_image.height;
    } else {
        var maxWidth = 400;
        var maxHeight = base_image.height * maxWidth / base_image.width;
    }

    //Carrega
    var resHeight = resWidth / aspectRatio;

    base_image.onload = function () {

        var $cropperModal = $("<div>", {
            id: "cropperPanel",
            class: "panel panel-info",
            width: maxWidth + 40
        }).append(
            $("<div>", {class: "panel-heading"}
                // MODAl HEATHER
            ).append(
                $("<div>", {}).append(
                    $("<button>", {
                        type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"
                    }),
                    $("<h3>", {
                        class: "modal-title", text: "Recorte de imagem"
                    })
                )
                // MODAl HEATHER
            )).append(
            $("<div>", {class: "panel-body"}).append(
                '<div><canvas id="viewport" width="' + maxWidth + '" height="' + maxHeight + '" ></canvas>' +
                '<canvas id="preview" width="' + resWidth + 'px" height="' + resHeight + 'px" style="display: none;"></canvas></div>'
            )
        ).append(
            $("<div>", {}).append(
                $("<button>", {
                    type: "submit", id: "btnCrop", class: "btn btn-lg btn-login btn-block",
                    text: "Recortar", value: result
                })
            ));
        $(form).append($("<div>", {class: 'cropBG'}).append($cropperModal));

        var canvas = document.getElementById('viewport'),
            context = canvas.getContext('2d');


        context.drawImage(base_image, 0, 0, base_image.width, base_image.height, 0, 0, maxWidth, maxHeight);


        //-------
        $('#viewport').Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            allowSelect: true,
            allowMove: true,
            allowResize: true,
            bgOpacity: 0.35,
            aspectRatio: aspectRatio
            //aspectRatio: 16 / 9
        });
    }


};


function updatePreview(c) {

    if (parseInt(c.w) > 0) {
        // Show image preview
        var imageObj = $("#viewport")[0];
        var canvas = $("#preview")[0];
        var context = canvas.getContext("2d");

        if (imageObj != null && c.x != 0 && c.y != 0 && c.w != 0 && c.h != 0) {
            context.drawImage(imageObj, c.x, c.y, c.w, c.h, 0, 0, canvas.width, canvas.height);
        }

    }
}


window.sortJsonByCol = function (property) {

    'use strict';
    return function (a, b) {
        var sortStatus = 0;
        if (a[property] < b[property]) {
            sortStatus = -1;
        } else if (a[property] > b[property]) {
            sortStatus = 1;
        }
        return sortStatus;
    };

};

//Gets object by  value
window.getObjects = function (obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
};


window.showCorrectionDD = function (word, id) {
    //substitui a dd exixtente novamento pelo span
    $("#correctionDD").replaceWith($('<span>', {
        html: $("#correctionDD").attr('word'),
        id: $("#correctionDD").attr('wordId')
    }));
    //Monta a dd
    var $correctionDD = $("<div>", {class: "dropdown", id: "correctionDD", word: word, wordId: id}).append(
        $("<button>", {
            class: "btn btn-default dropdown-toggle",
            type: "button",
            'data-toggle': "dropdown",
            html: word,
            style: 'padding:0px'
        }).append(
            $("<span>", {class: "caret"})
        ),
        $("<ul>", {class: "dropdown-menu"}).append(
            $("<li>", {class: "dropdown-submenu"}).append(
                $("<a>", {class: "test", tabindex: "-1", html: 'Exactidão'}).append(
                    $("<span>", {class: "caret"})
                ),
                $("<ul>", {class: "dropdown-menu"}).append(
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1",
                            class: "subError", err: 'accuracy:lettersubstitution', html: 'Substituição de letras'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1",
                            class: "subError",
                            err: 'accuracy:wordssubstitution',
                            html: 'Substituição de palavras'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {tabindex: "-1", class: "subError", err: 'accuracy:addition', html: 'Adições'})
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1",
                            class: "subError",
                            err: 'accuracy:wordsomission',
                            html: 'Omissões de letras'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1",
                            class: "subError",
                            err: 'accuracy:syllablesomission',
                            html: 'Omissão de sílabas'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1",
                            class: "subError",
                            err: 'accuracy:wordomission',
                            html: 'Omissão de palavras'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {tabindex: "-1", class: "subError", err: 'accuracy:inversions', html: 'Inversões'})
                    )
                )
            ),
            $("<li>", {class: "dropdown-submenu"}).append(
                $("<a>", {class: "test", tabindex: "-1", html: 'Fluidez'}).append(
                    $("<span>", {class: "caret"})
                ),
                $("<ul>", {class: "dropdown-menu"}).append(
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1", class: "subError",
                            err: 'fluidity:vacillation', html: 'Vacilação'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1", class: "subError",
                            err: 'fluidity:repetitions', html: 'Repetições'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1", class: "subError",
                            err: 'fluidity:spelling', html: 'Soletração'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1", class: "subError",
                            err: 'fluidity:wordsfragmentation',
                            html: 'Fragmentação de palavras'
                        })
                    ),
                    $("<li>").append(
                        $("<a>", {
                            tabindex: "-1", class: "subError",
                            err: 'fluidity:spontaneousrectification', html: 'Retificação espontânea'
                        })
                    )
                )
            )
        )
    );
    return $correctionDD;
};

//Preenche a div desejada com o som da pergunta

window.getQuestionVoice = function (questionID) {
    var self = this;
    self.bd2 = 'let_questions';
    self.site = 'http://letrinhas.ipt.pt/couchdb';//process.env.COUCHDB;
    var $soundDiv = $('<div>');
    $($soundDiv)
        .append(' <label class="col-md-2 audioLbl"> Professor </label>', $('<audio>', {
                class: "col-md-10",
                "controls": "controls",
                id: "teacherVoice" + questionID
            })
            .append(
                $('<source>', {
                    src: self.site + "/" + self.bd2 + "/" + questionID + "/voice.mp3",
                    type: "audio/mpeg"
                })
            )
        );
    return $soundDiv;
};

//Preenche a div desejada com a preview da pergunta
window.getTextPreview = function (question) {
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $soundDiv = getQuestionVoice(question._id);
    //Separa o texto em paragrafos
    var $paragraph = question.content.text.split(/\n/);
    var words = $();
    var nWords = 0;
    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        var $wordsList = line.split(" ");
        $.each($wordsList, function (i, word) {
            //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
            var wordTime = getObjects(question.content.wordTimes, 'pos', nWords)[0];
            //If word as associated time
            if (wordTime) {
                words = words.add($('<span>', {
                    text: word + " ",
                    id: "wd" + nWords,
                    class: "word",
                    'data-start': wordTime.start
                }))
            } else {
                words = words.add($('<span>', {
                    text: word + " ",
                    id: "wd" + nWords

                }))
            }
            //incrementa o nr de palavras (nao conta os breaks
            nWords++;
        });
        words = words.add('<br />')
    });

    $contentDiv.append($('<div>', {class: 'questBox', question: question._id}).append(
        words
    ));

    return [$contentDiv.wrap('<p/>').parent().html() + $soundDiv.wrap('<p/>').parent().html()]
};

window.setSyncr = function (question) {
    var pop = Popcorn("audio");

    $.each(question.content.wordTimes, function (id, time) {
        pop.footnote({
            start: time.start,
            end: time.end,
            text: '',
            target: 'wd' + time.pos,
            effect: "applyclass",
            applyclass: "selected"
        });
    });

    //pop.play();

    //var mySnd = document.getElementById("teacherVoice");
    //mySnd.playbackRate = 0.5;
    $('.word').click(function () {
        var audio = $('audio');
        audio[0].currentTime = parseFloat($(this).data('start'), 10);
        audio[0].play();
    });
};
//Preenche a div desejada com a preview da pergunta
window.setListPreview = function (question) {
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $soundDiv = getQuestionVoice(question._id);
    var nWords = 0;
    //Coloca as palavras nas coluna
    $.each(question.content.columns, function (i, column) {
        var words = $();

        $.each(column.words, function (iw, word) {
            words = words.add($('<span>', {
                    text: word,
                    id: "wd" + nWords
                }).add('<br>')
            );
            nWords++;
        });

        $contentDiv.append(
            $('<div>', {
                class: "col-md-" + (12 / question.content.columns.length)
            }).append(
                $('<div>', {
                        class: "questBox centered"
                    }
                ).append(words))
        );
    });
    return [$contentDiv.wrap('<p/>').parent().html(), $soundDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta
window.setInterpretationPreview = function (question) {
    //Carrega o som,
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $soundDiv = getQuestionVoice(question._id);
    var words = $();
    var $text = $('<div>', {class: 'questBox'});
    $contentDiv.append($text);


    //Separa o texto em paragrafos
    var $paragraph = question.content.text.split(/\n/);
    var words = $();
    var nWords = 0;
    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        var $wordsList = line.split(" ");
        $.each($wordsList, function (i, word) {
            //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)

            if (question.content.sid.indexOf(nWords + "") != -1) {
                words = words.add($('<span>', {
                    text: word + " ",
                    class: "markedWord"
                }))
            } else {
                words = words.add($('<span>', {
                    text: word + " "
                }))
            }
            //incrementa o nr de palavras (nao conta os breaks
            nWords++;
        });
        words = words.add('<br />')
    });
    $text.append(words);
    return [$contentDiv.wrap('<p/>').parent().html(), $soundDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta
window.setMultimediaPreview = function (question, div) {
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $answersDiv = $('<div>');
    //Se o questione for do tipo audio
    switch (question.content.questionType) {
        case "audio":
            //Adiciona o som
            $contentDiv.append(getQuestionVoice(question._id));
            break;
        case "image":
            //Adiciona a imagem
            $contentDiv.append($('<div>', {class: 'questBox centered'}).append(
                $('<img>', {src: question.content.question, class: "img-responsive"})
            ));
            break;
        case "text":
            //Adiciona o texto
            $contentDiv.append($('<label>', {class: 'col-md-12 questBox centered', text: question.content.question}));

            break;
    }
    //Mostra as opções de resposta
    var nWrongAnswers = question.content.answers.length;

    $.each(question.content.answers, function (i, key) {
            switch (question.content.answerType) {
                case "text":
                    $answersDiv
                        .append($('<div>', {class: 'col-md-' + 12 / nWrongAnswers}).append(
                            ($('<button>', {
                                value: i,
                                class: 'asnwerBox ' + (i == 0 ? "rightAnswer" : ""),
                                html: key.content
                            })))
                        )
                    break;
                case "image":
                    $answersDiv
                        .append($('<div>', {class: 'col-md-' + 12 / nWrongAnswers}).append(
                            ($('<img>', {
                                value: i,
                                class: 'asnwerBox ' + (i == 0 ? "rightAnswer" : ""),
                                src: key.content
                            })))
                        )
                    break;

            }
        }
    );
    //Efectua um shuffle ás respostas, para mudarem dinamicamente de posicoes
    $answersDiv.find(".asnwerBox").shuffle();
    return [$contentDiv.wrap('<p/>').parent().html(), $answersDiv.wrap('<p/>').parent().html()];
};

//Preenche a div desejada com a preview da pergunta
window.setBoxesPreview = function (question) {
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var nWords = 0;
    //Por cada coluna: Coloca as palavras nas coluna
    $.each(question.content.boxes, function (i, box) {
        var words = $();
        //Por cada palavra
        $.each(box.words, function (iw, word) {
            words = words.add($('<span>', {
                    text: word,
                    id: "wd" + nWords
                }).add('<br>')
            );
            nWords++;
        });

        $contentDiv.append(
            $('<div>', {
                class: "col-md-" + (12 / question.content.boxes.length)
            }).append(
                $('<div>', {
                        class: "questBox centered box" + i
                    }
                ).append($('<span>', {
                        text: box.name,
                        id: box._id,
                        class: "boxTitle" + i

                    }), $('<hr>', {}))
                    .append(words))
        );
    });
    return [$contentDiv.wrap('<p/>').parent().html()]
};


//*******************************************CORRECOES**********


//Exibe os detalhes da pergunta, as eventuais respostas e a correcao automatica
window.getCorrectionPreview = function (question) {
    //Consoante o tipo de pergunta
    switch (question.info.type) {
        case'text':
            return setCorrecTextPreview(question)
            break;
        case'list':
            return setCorrecListPreview(question)
            break;
        case'multimedia':
            return setCorrecMultimediaPreview(question)
            break;
        case'interpretation':
            return setCorrecInterpretationPreview(question)
            break;
        case'boxes':
            return setCorrecBoxesPreview(question)
            break;
        case'whitespaces':
            return setCorrecWhiteSpacesPreview(question)
            break;
    }
}
//Preenche a div desejada com a preview da pergunta
window.setCorrecInterpretationPreview = function (question) {
    var info = question.info;
    var resol = question.resol;
    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));

    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });

    var $soundDiv = getQuestionVoice(info._id);
    var words = $();
    var $text = $('<div>', {class: 'questBox col-md-12'});
    $contentDiv.append($text);


    //Separa o texto em paragrafos
    var $paragraph = info.content.text.split(/\n/);
    var words = $();
    var nWords = 0;
    var nRights = 0;
    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        var $wordsList = line.split(" ");
        $.each($wordsList, function (i, word) {
            //Se a palavra esta marcada
            if (info.content.sid.indexOf(nWords + "") != -1) {
                //se o aluno a encontrou
                if (resol.answer.solution.indexOf(nWords + "") != -1) {
                    words = words.add($('<span>', {
                        text: word + " ",
                        class: "rightAnswer"
                    }))
                    nRights++;
                } else {
                    words = words.add($('<span>', {
                        text: word + " ",
                        class: "markedWord"
                    }))
                }
            } else {
                //se o aluno a encontrou
                if (resol.answer.solution.indexOf(nWords + "") != -1) {
                    words = words.add($('<span>', {
                        text: word + " ",
                        class: "wrongAnswer"
                    }))
                } else {
                    words = words.add($('<span>', {
                        text: word + " "
                    }))
                }

            }

            //incrementa o nr de palavras (nao conta os breaks
            nWords++;
        });
        words = words.add('<br />')
    });
    $text.append(words);
    //Valor individual de cada opcao
    value = 100 / info.content.sid.length;
    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de opções'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", html: info.content.sid.length
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções correctas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row rightAnswer", html: nRights
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções erradas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row wrongAnswer", html: resol.answer.solution.length - nRights
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções não encontradas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row markedWord", html: info.content.sid.length - nRights
            }
        ),
        $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: (nRights * value).toFixed(2)
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
        )
    )

    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }).append(
            $contentDiv
        ), $contentDiv, $correctDiv
    );
    return [$formDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta
window.setCorrecMultimediaPreview = function (question) {
    var info = question.info;
    var resol = question.resol;
    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));

    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });

    var $answersDiv = $('<div>');
    //Se o questione for do tipo audio
    switch (info.content.questionType) {
        case "audio":
            //Adiciona o som
            $contentDiv.append(getQuestionVoice(info._id));
            break;
        case "image":
            //Adiciona a imagem
            $contentDiv.append($('<div>', {class: 'col-md-12 questBox centered'}).append(
                $('<img>', {src: info.content.question})
            ));
            break;
        case "text":
            //Adiciona o texto
            $contentDiv.append($('<label>', {class: 'col-md-12 questBox centered', text: info.content.question}));
            break;
    }
    //Mostra as opções de resposta
    var nWrongAnswers = info.content.answers.length;

    switch (info.content.answerType) {
        case "text":
            $.each(info.content.answers, function (i, key) {
                $answersDiv
                    .append($('<div>', {class: 'col-md-' + 12 / nWrongAnswers}).append(
                        ($('<button>', {
                            value: i,
                            /*Maraca a opcao correcta e a escolhida*/
                            class: 'asnwerBox ' + (i == 0 ? "rightAnswer" : (i == resol.answer.solution ? " wrongAnswer" : "")),
                            html: key.content
                        })))
                    )
            })
            ;
            break;
        case
        "image"        :
            $.each(info.content.answers, function (i, key) {
                $answersDiv
                    .append($('<div>', {class: 'col-md-' + 12 / nWrongAnswers}).append(
                        ($('<img>', {
                            value: i,
                            class: 'asnwerBox ' + (i == 0 ? "rightAnswer" : ""),
                            src: key.content
                        })))
                    )
            })
            ;
            break;

    }

    $contentDiv.append($answersDiv);

    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Resposta do aluno'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", html: (0 == resol.answer.solution ? "Correcta" : "Incorrecta")
            }
        ),
        $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: (0 == resol.answer.solution ? "100" : "0")
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
        )
    )

    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }).append(
            $contentDiv
        ), $contentDiv, $correctDiv
    );
    return [$formDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta e verifica a correcao
window.setCorrecListPreview = function (question) {

    var info = question.info;
    var resol = question.resol;

    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));
    //Carrega o som,
    var $soundDiv = getQuestionVoice(info._id);
    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });
    //Separa o texto em paragrafos
    //var $paragraph = info.content.text.split(/\n/);
    var words = $();
    var nWords = 0;

    var studentDuration = 0;

//Coloca as palavras nas coluna
    $.each(info.content.columns, function (i, column) {
        var words = $();

        $.each(column.words, function (iw, word) {
            words = words.add($('<span>', {
                    text: word,
                    id: "wd" + nWords
                }).add('<br>')
            );
            nWords++;
        });

        $contentDiv.append(
            $('<div>', {
                class: "col-md-" + (12 / info.content.columns.length)
            }).append(
                $('<div>', {
                        class: "questBox centered"
                    }
                ).append(words))
        );
    });
    //Calcula o nr de palavras por segundo
    var x = document.createElement("AUDIO");
    x.setAttribute("src", "http://letrinhas.ipt.pt/couchdb/let_resolutions/" + resol._id + "/record.m4a");
    x.addEventListener("loadedmetadata", function (_event) {
        studentDuration = x.duration;
        $("#" + info._id + " #wordsMin").html(parseInt(nWords / (studentDuration / 60)));
    });

    $contentDiv.append(
        $soundDiv, $('<label>', {class: "col-md-2 audioLbl", html: 'Aluno'}),
        $('<audio>', {
            class: "col-md-10", "controls": "controls",
            id: "studentsVoice"
        })
            .append(
                $('<source>', {
                    src: "http://letrinhas.ipt.pt/couchdb/let_resolutions/" + resol._id + "/record.m4a",
                    type: "audio/mp4"
                })
            )
    );

    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de palavras:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "wordsCount", html: nWords
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Palavras por minuto:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "wordsMin", html: parseInt(nWords / (studentDuration / 60))
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de erros:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "errorCount", html: '0'
            }
        ), $('<div>', {class: "col-md-12 "}).append(
            $('<div>', {class: "input-group"}).append(
                $('<input>', {
                        readonly: 'readonly', class: "form-control mandatory",
                        questionID: info._id, value: "0", id: "fluidity"
                    }
                ),
                $('<span>', {
                        class: "input-group-addon btn-white", style: "width: 100px;", html: 'Fluidez'
                    }
                ),
                $('<select>', {class: 'form-control', id: "fluidityDif"}
                ).append(
                    $('<option>', {disbled: 'disabled', selected: 'selected', html: 'Peso'}),
                    $('<option>', {disbled: 'disabled', html: '1'}),
                    $('<option>', {disbled: 'disabled', html: '2'}),
                    $('<option>', {disbled: 'disabled', html: '3'}),
                    $('<option>', {disbled: 'disabled', html: '4'}),
                    $('<option>', {disbled: 'disabled', html: '5'})
                )
            )
            /*Precisao*/
        ), $('<div>', {class: "col-md-12 row"}).append(
            $('<div>', {class: "input-group"}).append(
                $('<input>', {
                        readonly: 'readonly', class: "form-control mandatory",
                        questionID: info._id, value: "0", id: "accuracy"
                    }
                ),
                $('<span>', {
                        class: "input-group-addon btn-white", style: "width: 100px;", html: 'Exactião'
                    }
                ),
                $('<select>', {class: 'form-control', id: "accuracyDif"}
                ).append(
                    $('<option>', {disbled: 'disabled', selected: 'selected', html: 'Peso'}),
                    $('<option>', {disbled: 'disabled', html: '1'}),
                    $('<option>', {disbled: 'disabled', html: '2'}),
                    $('<option>', {disbled: 'disabled', html: '3'}),
                    $('<option>', {disbled: 'disabled', html: '4'}),
                    $('<option>', {disbled: 'disabled', html: '5'})
                )
            )
            /*Tempo*/
        ), $('<div>', {class: "col-md-12 row"}).append(
            $('<div>', {class: "input-group"}).append(
                $('<select>', {class: 'form-control', id: "time", name: "time"}
                ).append(
                    $('<option>', {disabled: 'disabled', selected: 'selected', html: 'Tempo'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                ),
                $('<span>', {class: 'input-group-addon btn-white'}).append(
                    $('<i>', {class: 'fa fa-clock-o'})),
                $('<select>', {class: 'form-control', id: "timeDif"}
                ).append(
                    $('<option>', {disabled: 'true', selected: 'true', html: 'Peso'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                )
            )
        ), $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: 0
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
            /*FLUIDEZ*/
        )
    )

    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }), $contentDiv, $correctDiv
    );

    return [$formDiv.wrap('<p/>').parent().html()]


}

//Preenche a div desejada com a preview da pergunta e verifica a correcao
window.setCorrecTextPreview = function (question) {

    var info = question.info;
    var resol = question.resol;

    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));
    //Carrega o som,
    var $soundDiv = getQuestionVoice(info._id);
    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });
    //Separa o texto em paragrafos
    var $paragraph = info.content.text.split(/\n/);
    var words = $();
    var nWords = 0;

    var studentDuration = 0;

    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        var $wordsList = line.split(" ");
        $.each($wordsList, function (i, word) {
            //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
            var wordTime = getObjects(info.content.wordTimes, 'pos', nWords)[0];
            //If word as associated time
            if (wordTime) {
                words = words.add($('<span>', {
                    text: word + " ",
                    id: "wd" + nWords,
                    class: "word",
                    'data-start': wordTime.start
                }))
            } else {
                words = words.add($('<span>', {
                    text: word + " ",
                    id: "wd" + nWords

                }))
            }
            //incrementa o nr de palavras (nao conta os breaks
            nWords++;
        });
        words = words.add('<br />')
    });

    //Calcula o nr de palavras por segundo
    var x = document.createElement("AUDIO");
    x.setAttribute("src", "http://letrinhas.ipt.pt/couchdb/let_resolutions/" + resol._id + "/record.m4a");
    x.addEventListener("loadedmetadata", function (_event) {
        studentDuration = x.duration;
        $("#" + info._id + " #wordsMin").html(parseInt(nWords / (studentDuration / 60)));
    });

    $contentDiv.append($('<div>', {class: 'questBox col-md-12', question: info._id}).append(
        words
        ), $soundDiv, $('<label>', {class: "col-md-2 audioLbl", html: 'Aluno'}),
        $('<audio>', {
            class: "col-md-10", "controls": "controls",
            id: "studentsVoice"
        })
            .append(
                $('<source>', {
                    src: "http://letrinhas.ipt.pt/couchdb/let_resolutions/" + resol._id + "/record.m4a",
                    type: "audio/mp4"
                })
            )
    );

    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de palavras:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "wordsCount", html: nWords
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Palavras por minuto:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "wordsMin", html: parseInt(nWords / (studentDuration / 60))
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de erros:'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", id: "errorCount", html: '0'
            }
        ), $('<div>', {class: "col-md-12 "}).append(
            $('<div>', {class: "input-group"}).append(
                $('<input>', {
                        readonly: 'readonly', class: "form-control mandatory",
                        questionID: info._id, value: "0", id: "fluidity"
                    }
                ),
                $('<span>', {
                        class: "input-group-addon btn-white", style: "width: 100px;", html: 'Fluidez'
                    }
                ),
                $('<select>', {class: 'form-control', id: "fluidityDif"}
                ).append(
                    $('<option>', {disbled: 'disabled', selected: 'selected', html: 'Peso'}),
                    $('<option>', {disbled: 'disabled', html: '1'}),
                    $('<option>', {disbled: 'disabled', html: '2'}),
                    $('<option>', {disbled: 'disabled', html: '3'}),
                    $('<option>', {disbled: 'disabled', html: '4'}),
                    $('<option>', {disbled: 'disabled', html: '5'})
                )
            )
            /*Precisao*/
        ), $('<div>', {class: "col-md-12 row"}).append(
            $('<div>', {class: "input-group"}).append(
                $('<input>', {
                        readonly: 'readonly', class: "form-control mandatory",
                        questionID: info._id, value: "0", id: "accuracy"
                    }
                ),
                $('<span>', {
                        class: "input-group-addon btn-white", style: "width: 100px;", html: 'Exactião'
                    }
                ),
                $('<select>', {class: 'form-control', id: "accuracyDif"}
                ).append(
                    $('<option>', {disbled: 'disabled', selected: 'selected', html: 'Peso'}),
                    $('<option>', {disbled: 'disabled', html: '1'}),
                    $('<option>', {disbled: 'disabled', html: '2'}),
                    $('<option>', {disbled: 'disabled', html: '3'}),
                    $('<option>', {disbled: 'disabled', html: '4'}),
                    $('<option>', {disbled: 'disabled', html: '5'})
                )
            )
            /*Tempo*/
        ), $('<div>', {class: "col-md-12 "}).append(
            $('<div>', {class: "input-group"}).append(
                $('<select>', {class: 'form-control', id: "time", name: "time"}
                ).append(
                    $('<option>', {disabled: 'disabled', selected: 'selected', html: 'Tempo'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                ),
                $('<span>', {
                        class: "input-group-addon btn-white"
                    }
                ).append($('<i>', {class: 'fa fa-clock-o'})),
                $('<select>', {class: 'form-control', id: "timeDif"}
                ).append(
                    $('<option>', {disabled: 'true', selected: 'true', html: 'Peso'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                )
            )
            /*Expressividade*/
        ), $('<div>', {class: "col-md-12 row"}).append(
            $('<div>', {class: "input-group"}).append(
                $('<select>', {class: 'form-control', id: "expression", name: "expression"}
                ).append(
                    $('<option>', {disabled: 'disabled', selected: 'selected', html: 'Expressividade'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                ),
                $('<span>', {
                    class: "input-group-addon btn-white"
                }).append($('<i>', {class: 'fa fa-comment-o'})),
                $('<select>', {class: 'form-control', id: "expressionDif"}
                ).append(
                    $('<option>', {disabled: 'disabled', selected: 'selected', html: 'Peso'}),
                    $('<option>', {html: '1'}),
                    $('<option>', {html: '2'}),
                    $('<option>', {html: '3'}),
                    $('<option>', {html: '4'}),
                    $('<option>', {html: '5'})
                )
            )
        ), $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: 0
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
            /*FLUIDEZ*/
        )
    )

    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }), $contentDiv, $correctDiv
    );

    return [$formDiv.wrap('<p/>').parent().html()]


}

//Preenche a div desejada com a preview da pergunta e verifica a correcao
window.setCorrecBoxesPreview = function (question) {

    var info = question.info;
    var resol = question.resol;

    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));
    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });
    var nWords = 0;
    var classe = '';
    var nRights = 0;
    <!--cotacao de cada perg-->
    var value = 0;

    //Prepara o conteudo da pergunta
    $.each(info.content.boxes, function (i, box) {
        var words = $();
        //Obtem as respostas do aluno e verifica se sao iguasi
        var answer = getObjects(resol.answer.boxes, '_id', box._id)[0].words;
        $.each(box.words, function (iw, word) {

            //Verifica se o aluno seleccionaou e soma as certas ou erradas
            if (jQuery.inArray(word + "", answer) != -1) {
                nRights++;
                classe = 'rightBox';
            } else {
                classe = 'wrongBox';
            }

            words = words.add($('<span>', {
                    text: word,
                    id: "wd" + nWords,
                    class: classe
                }).add('<br>')
            );
            nWords++;
        });

        $contentDiv.append(
            $('<div>', {
                class: "col-md-" + (12 / info.content.boxes.length)
            }).append(
                $('<div>', {
                        class: "questBox centered box" + i
                    }
                ).append($('<span>', {
                        text: box.name,
                        id: box._id,
                        class: "boxTitle" + i

                    }), $('<hr>', {}))
                    .append(words)
            )
        );
    });

    //Valor individual de cada opcao
    value = 100 / nWords;

    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de opções'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", html: nWords
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções correctas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row rightBox", html: nRights
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções erradas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row wrongBox", html: nWords - nRights
            }
        ), $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: (nRights * value).toFixed(2)
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
        )
    )
    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }), $contentDiv, $correctDiv
    );

    return [$formDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta
window.setCorrecWhiteSpacesPreview = function (question) {
    var info = question.info;
    var resol = question.resol;
    var $formDiv = $('<form>', {id: info._id, type: info.type});
    var $contentDiv = $('<div>', {class: "col-md-7"});
    $contentDiv.append($('<label>', {
        class: "dataTitle col-md-12", html: info.title
    }).append('<hr>'));

    var $correctDiv = $('<div>', {
        class: "col-md-5",
        style: "border-left: 1px solid #f9cfdc;max-width: 352px;"
    });
    var nWords = 0;
    var classe = '';
    var nRights = 0;
    <!--cotacao de cada perg-->
    var value = 0;


    var Sids = [];
    //Recolhe todos os spans marcados
    $.each(info.content.sid, function (iList, list) {
        Sids = Sids.concat(list.sids);
    })
    //Carrega o som,
    var $soundDiv = getQuestionVoice(info._id);
    var words = $();
    var $text = $('<div>', {class: 'questBox col-md-12 '});
    $contentDiv.append($text);
    $contentDiv.append($soundDiv);

    //Separa o texto em paragrafos
    var $paragraph = info.content.text.split(/\r|\n/);
    var words = $();
    var nWords = 0;

    var rightAnswers = [];
    //Verifica todas as strings
    $.each(info.content.sid, function (iSid, sid) {
        //Obtem o array de indices para determinada string
        var res = getObjects(resol.answer.whitespaces, 'text', sid.text)[0];
        if (res) {
            rightAnswers = rightAnswers.concat(_.intersection(sid.sids, getObjects(resol.answer.whitespaces, 'text', sid.text)[0].sid))
        }
    });

    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        if (line) {
            var $wordsList = line.replace(/\,/gi, " ,").replace(/\-/gi, "- ").replace(/\:/gi, " :").replace(/\./gi, " .").replace(/\!/gi, " !").replace(/\?/gi, " ?").split(" ");
            $.each($wordsList, function (i, word) {

                if (word) {
                    //Verifica se o aluno seleccionaou e soma as certas ou erradas
                    if (jQuery.inArray(nWords + "", rightAnswers) != -1) {
                        nRights++;
                        classe = 'rightAnswer';
                    } else {
                        classe = 'wrongAnswer';
                    }
                    //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                    words = words.add($('<span>', {
                        //Coloca um espaco a frente da palavra, se a segiur nao existir pontuacao
                        text: word + ' ',
                        id: 'sid' + nWords,
                        //Verifica se a palavra ja foi previamente seleccionada e se faz parte das respostas
                        class: "selectable " + (jQuery.inArray(nWords + "", Sids) != -1 ? 'whitespace ' + classe : '')
                    }))
                    //incrementa o nr de palavras (nao conta os breaks
                    nWords++;
                }
            });
            words = words.add('<br />')
        }
    });
    $text.append(words);

    //Valor individual de cada opcao
    value = 100 / Sids.length;


    //Prepara o conteudo da correcao
    $correctDiv.append(
        $('<label>', {
                class: "dataTitle col-md-12 row", html: 'Correção'
            }
        ).append('<hr>'),
        $('<label>', {
                class: "col-md-7 row", html: 'Total de opções'
            }
        ),
        $('<label>', {
                class: "col-md-5 row", html: Sids.length
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções correctas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row rightAnswer", html: nRights
            }
        ),
        $('<label>', {
                class: "col-md-7 row", html: 'Opções erradas'
            }
        ),
        $('<label>', {
                class: "col-md-5 row wrongAnswer", html: Sids.length - nRights
            }
        ), $('<div>', {
                class: "col-md-12 row"
            }
        ).append(
            $('<input>', {
                type: "number", class: "form-control mandatory", questionID: info._id,
                placeholder: "Nota", name: "note", readonly: "readonly",
                dif: question.dif, value: (nRights * value).toFixed(2)
            }),
            $('<span>', {
                class: "glyphicon"
            }).append(
                $('<i>', {
                    class: "fa fa-percent"
                })
            )
        )
    )

    /*Adciona o id, o conteudo e a correcao da pergunta*/
    $formDiv.append(
        $('<input>', {
            type: "hidden", name: "resolID", value: resol._id
        }).append(
            $contentDiv
        ), $contentDiv, $correctDiv
    );
    return [$formDiv.wrap('<p/>').parent().html()]
};

window.autoCorrecWhiteSpaces = function (question, resol) {
    var Sids = [];
    //Recolhe todos os spans marcados
    $.each(question.content.sid, function (iList, list) {
        Sids = Sids.concat(list.sids);
    })
    //Carrega o som,
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $soundDiv = getQuestionVoice(question._id);
    var words = $();
    var $text = $('<div>', {class: 'questBox'});
    $contentDiv.append($text);
    //Separa o texto em paragrafos
    var $paragraph = question.content.text.split(/\r|\n/);
    var words = $();
    var nWords = 0;

    var rightAnswers = [];
    //Verifica todas as strings
    $.each(question.content.sid, function (iSid, sid) {
        //Obtem o array de indices para determinada string
        var res = getObjects(resol.answer.whitespaces, 'text', sid.text)[0];
        if (res) {
            rightAnswers = rightAnswers.concat(_.intersection(sid.sids, getObjects(resol.answer.whitespaces, 'text', sid.text)[0].sid))

        }

    });
    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        if (line) {
            var $wordsList = line.replace(/\,/gi, " ,").replace(/\-/gi, "- ").replace(/\:/gi, " :").replace(/\./gi, " .").replace(/\!/gi, " !").replace(/\?/gi, " ?").split(" ");
            $.each($wordsList, function (i, word) {
                if (word) {
                    //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                    words = words.add($('<span>', {
                        //Coloca um espaco a frente da palavra, se a segiur nao existir pontuacao
                        text: word + ' ',
                        id: 'sid' + nWords,
                        //Verifica se a palavra ja foi previamente seleccionada e se faz parte das respostas
                        class: "selectable " + (jQuery.inArray(nWords + "", Sids) != -1 ? 'whitespace' : '') + (jQuery.inArray(nWords + "", rightAnswers) != -1 ? ' rightAnswer' : '')
                    }))
                    //incrementa o nr de palavras (nao conta os breaks
                    nWords++;
                }
            });
            words = words.add('<br />')
        }
    });
    $text.append(words);
    return [$contentDiv.wrap('<p/>').parent().html(), $soundDiv.wrap('<p/>').parent().html()]
};

//Preenche a div desejada com a preview da pergunta
window.setWhiteSpacesPreview = function (question) {

    var Sids = [];
    //Recolhe todos os spans marcados
    $.each(question.content.sid, function (iList, list) {
        Sids = Sids.concat(list.sids);
    })
    //Carrega o som,
    var $contentDiv = $('<div>', {class: 'col-md-12'});
    var $soundDiv = getQuestionVoice(question._id);
    var words = $();
    var $text = $('<div>', {class: 'questBox'});
    $contentDiv.append($text);
    //Separa o texto em paragrafos
    var $paragraph = question.content.text.split(/\r|\n/);
    var words = $();
    var ponctuation = ['.', '!', '?', '-', ';', ':'];
    var nWords = 0;
    //por cada paragrafo adiciona a palavra a lista, e a new line
    $.each($paragraph, function (iLine, line) {
        if (line) {
            var $wordsList = line.replace(/\,/gi, " ,").replace(/\-/gi, "- ").replace(/\:/gi, " :").replace(/\./gi, " .").replace(/\!/gi, " !").replace(/\?/gi, " ?").split(" ");
            $.each($wordsList, function (i, word) {
                if (word) {
                    //Replace String With Selectable Span (Não esquecer os PARAGRAFOS)
                    words = words.add($('<span>', {
                        //Coloca um espaco a frente da palavra, se a segiur nao existir pontuacao
                        text: word + ' ',
                        id: 'sid' + nWords,
                        //Verifica se a palavra ja foi previamente seleccionada
                        class: "selectable " + (jQuery.inArray(nWords + "", Sids) != -1 ? 'whitespace' : '')
                    }))
                    //incrementa o nr de palavras (nao conta os breaks
                    nWords++;
                }
            });
            words = words.add('<br />')
        }
    });
    $text.append(words);
    return [$contentDiv.wrap('<p/>').parent().html(), $soundDiv.wrap('<p/>').parent().html()]
};

window.loadingSpinner = function () {
    return $('<div>', {class: "cssload-container"}).append(
        $('<div>', {class: "cssload-whirlpool"}),
        $('<p>', {text: "A carregar..."})
    )
};

//Shows some class info
window.showClassInfo = function (idSchool, idClass) {

    $("#mClass").remove();

    //Recolhe os dados da turma
    modem('GET', 'schools/' + idSchool + '/classes/' + idClass,
        //Response Handler
        function (classData) {

            var $modalBody = $('<div>', {class: 'row'});
            //por cada aluno cria um quadrado com a sua foto e nome
            $.each(classData.students, function (iS, student) {
                //Separa o nome
                var name = student.name.split(" ");
                $modalBody.append(
                    $('<div>', {class: 'col-md-3'}).append(
                        $('<a>', {
                            href: "#students/" + student._id + "/info"
                        }).append(
                            $('<img>', {class: 'dataImage', src: student.b64}),
                            $('<p>', {class: 'pictureLabel', html: name[0] + " " + name[name.length - 1]})
                        ).click(function () {
                            //actualiza a pagina
                            document.location.reload(true);
                        })
                    )
                )
            })

            var $classModal = $("<div>", {
                    class: "modal fade", tabindex: "-1", id: "mClass", role: "dialog",
                    "aria-labelledby": "myModalLabel", "aria-hidden": "true"
                }).append(
                $("<div>", {class: "modal-dialog modal-lg"}).append(
                    $("<div>", {class: "modal-content"}
                        // MODAl HEATHER
                    ).append(
                        $("<div>", {class: "modal-header"}).append(
                            $("<button>", {
                                type: "button", class: "close", "data-dismiss": "modal", "aria-label": "Close"
                            }),
                            $("<h3>", {
                                class: "modal-title", text: classData.year + "º " + classData.name
                            })
                        )
                        // MODAl HEATHER
                    ).append(
                        $("<div>", {
                            class: "modal-body",
                        }).append(
                            $modalBody
                        )
                    )
                ))
                ;

            $('body').append($classModal);
            $("#mClass").modal("show");

        },
        //Error Handling
        function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
        }
    )

};

window.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

window.getStudentStatistics = function (tests) {

    //lista de testes agrupados por disciplina
    var groupByTest = _.groupBy(tests, 'subject');

    //grupo de testes so de leitura
    var groupByReading = _.filter(tests, function (test) {
        return test.type == 'text' || test.type == 'list';
    });
    //agrupa os testes de leitura por disciplina
    groupByReading = _.groupBy(groupByReading, 'subject');

    var $tbodyDisc = $('<tbody>');
    var noteSum = 0;
    var noteAvrg = 0;
    //calcula a media nao poderada das perguntas agrupadas por disciplina
    $.each(groupByTest, function (iDisc, disc) {
        noteSum = 0;
        noteAvrg = 0;
        //por cada pergunta
        $.each(disc, function (iQuest, quest) {
            noteSum += parseFloat(quest.note);
        });
        noteAvrg = ( noteSum / disc.length).toFixed(2);
        $tbodyDisc.append(
            $('<tr>').append(
                $('<td>', {html: iDisc}),
                $('<td>', {html: noteAvrg})
            )
        );
    });


    var $statDisc = $('<div>');
    //ESTATISTICA GERAL
    var $tableDisc = $('<table>', {
        class: "highchart", 'data-graph-container-before': "1", 'data-graph-type': "column", style: "display:none",
        'data-graph-xaxis-start-on-tick': "1"
    }).append(
        $('<thead>').append(
            $('<tr>').append(
                $('<th>', {html: 'Disciplina'}),
                $('<th>', {html: 'Media'})
            )
        ), $tbodyDisc);
    var $navPillsDisc = $('<ul>', {class: 'nav nav-pills'}).append(
        $('<li>', {class: 'active'}).append(
            $('<a>', {'data-toggle': "pill", href: "#geral", html: 'Geral'})
        )
    );
    var $tabContentDisc = $('<ul>', {class: 'tab-content'}).append(
        $('<div>', {id: 'geral', class: "tab-pane fade in active"}).append(
            $tableDisc
        )
    );

    //ESTATISTICA POR DISCIPLINA
    //Por cada disciplina adiciona um tab e um grafico com a evolucao
    $.each(groupByTest, function (iDisc, disc) {
        $navPillsDisc.append(
            $('<li>').append(
                $('<a>', {'data-toggle': "pill", href: "#" + iDisc}).append(
                    $('<img>', {src: "img/" + iDisc + ".png", class: "smallImgPreView"})
                )
            )
        );
        $tbodyDisc = $('<tbody>');
        //Cria o grafico de evolucao da disciplina
        $.each(disc, function (iQuest, quest) {
            $tbodyDisc.append(
                $('<tr>').append(
                    $('<td>', {html: quest.resolutionDate}),
                    $('<td>', {html: quest.note})
                )
            );
        });

        var $table1 = $('<table>', {
            class: "highchart", 'data-graph-container-before': "1", 'data-graph-type': "line", style: "display:none",
            'data-graph-xaxis-start-on-tick': "1"
        }).append(
            $('<thead>').append(
                $('<tr>').append(
                    $('<th>', {html: 'Data'}),
                    $('<th>', {html: 'Nota'})
                )
            ), $tbodyDisc);

        $tabContentDisc.append(
            $('<div>', {id: iDisc, class: "tab-pane fade in"}).append(
                $('<h3>', {html: 'Progresso por disciplina'}),
                $table1
            )
        );
    });
    $statDisc.append($navPillsDisc, $tabContentDisc)


    /*****************************************************************************************************/
    var $tbodyRead = $('<tbody>');
    var noteSum = 0;
    var noteAvrg = 0;
    //calcula a media nao poderada das perguntas agrupadas por disciplina
    $.each(groupByReading, function (iDisc, disc) {
        noteSum = 0;
        noteAvrg = 0;
        //por cada pergunta
        $.each(disc, function (iQuest, quest) {
            noteSum += parseFloat(quest.note);
        });
        noteAvrg = ( noteSum / disc.length).toFixed(2);
        $tbodyRead.append(
            $('<tr>').append(
                $('<td>', {html: iDisc}),
                $('<td>', {html: noteAvrg})
            )
        );
    });

    var $statRead = $('<div>');
    //ESTATISTICA GERAL
    var $tableRead = $('<table>', {
        class: "highchart", 'data-graph-container-before': "1", 'data-graph-type': "column", style: "display:none",
        'data-graph-xaxis-start-on-tick': "1"
    }).append(
        $('<thead>').append(
            $('<tr>').append(
                $('<th>', {html: 'Disciplina'}),
                $('<th>', {html: 'Média'})
            )
        ), $tbodyRead);

    var $navPillsRead = $('<ul>', {class: 'nav nav-pills'}).append(
        $('<li>', {class: 'active'}).append(
            $('<a>', {'data-toggle': "pill", href: "#geral" + 'Read', html: 'Geral'})
        )
    );
    var $tabContentRead = $('<ul>', {class: 'tab-content'}).append(
        $('<div>', {id: 'geral' + 'Read', class: "tab-pane fade in active"}).append(
            $tableRead
        )
    );

    //ESTATISTICA POR DISCIPLINA
    //Por cada disciplina adiciona um tab e um grafico com a evolucao
    $.each(groupByReading, function (iDisc, disc) {
        $navPillsRead.append(
            $('<li>').append(
                $('<a>', {'data-toggle': "pill", href: "#" + iDisc + 'Read'}).append(
                    $('<img>', {src: "img/" + iDisc + ".png", class: "smallImgPreView"})
                )
            )
        );
        $tbodyRead = $('<tbody>');
        //Cria o grafico de evolucao da disciplina
        $.each(disc, function (iQuest, quest) {
            //verifica a percentagem de fliudez (nr erros* 100 / nr palavras)
            var fluidity = 100 - ((_.filter(quest.errors, function (error) {
                    return error.error == 'fluidity';
                }).length) * 100 / quest.wordsCount);
            var accuracy = 100 - ((_.filter(quest.errors, function (error) {
                    return error.error == 'accuracy';
                }).length) * 100 / quest.wordsCount);
            $tbodyRead.append(
                $('<tr>').append(
                    $('<td>', {html: quest.resolutionDate}),
                    $('<td>', {html: quest.note}),
                    $('<td>', {
                        html: fluidity
                    }), $('<td>', {
                        html: accuracy
                    })
                )
            );
        });

        var $tableRead = $('<table>', {
            class: "highchart", 'data-graph-container-before': "1", 'data-graph-type': "line", style: "display:none",
            'data-graph-xaxis-start-on-tick': "1"
        }).append(
            $('<thead>').append(
                $('<tr>').append(
                    $('<th>', {html: 'Data'}),
                    $('<th>', {html: 'Nota'}),
                    $('<th>', {html: 'Fluidez'}),
                    $('<th>', {html: 'Expressividade'})
                    //$('<th>', {html: 'Tempo'})
                )
            ), $tbodyRead);
        $tabContentRead.append(
            $('<div>', {id: iDisc + 'Read', class: "tab-pane fade in"}).append(
                $('<h3>', {html: 'Progresso por disciplina'}),
                $tableRead
            )
        );
    });
    $statRead.append($navPillsRead, $tabContentRead);
    //cria um panel collapsible com as estatisticas
    var $panel = $('<div>', {class: 'panel-group', id: "accordion"}).append(
        $('<div>', {class: 'panel panel-success'}).append(
            $('<div>', {class: 'panel-heading'}).append(
                $('<h4>', {class: 'panel-title'}).append(
                    $('<a>', {
                        'data-toggle': "collapse",
                        'data-parent': "#accordion",
                        href: "#collapse1",
                        html: 'Estatísticas Disciplinares'
                    })
                )
            ),
            $('<div>', {id: "collapse1", class: "panel-collapse collapse"}).append(
                $('<div>', {class: "panel-body"}).append(
                    $statDisc
                ),
                $('<div>', {class: "panel-footer"}).append(

                )
            )
        ), $('<div>', {class: 'panel panel-warning'}).append(
            $('<div>', {class: 'panel-heading'}).append(
                $('<h4>', {class: 'panel-title'}).append(
                    $('<a>', {
                        'data-toggle': "collapse",
                        'data-parent': "#accordion",
                        href: "#collapse2",
                        html: 'Estatísticas de Leitura'
                    })
                )
            ),
            $('<div>', {id: "collapse2", class: "panel-collapse collapse"}).append(
                $('<div>', {class: "panel-body"}).append(
                    $statRead
                ),
                $('<div>', {class: "panel-footer"}).append(

                )
            )
        )
    )

    return [$panel.wrap('<p/>').parent().html()]
}


window.activateSteps = function (steps) {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        //update progress
        var step = $(e.target).data('step');
        var percent = (parseInt(step) / steps) * 100;

        $('.progress-bar').css({width: percent + '%'});
        $('.progress-bar').text("Step " + step + " of " + steps);

        //e.relatedTarget // previous tab

    })
}

window.setDataTables = function () {
    $('table').DataTable({
        "language": {
            "decimal": "",
            "emptyTable": "No data available in table",
            "info": "Mostra _START_ de _END_ em _TOTAL_ entradas",
            "infoEmpty": "Showing 0 to 0 of 0 entries",
            "infoFiltered": "(filtered from _MAX_ total entries)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Ver _MENU_ ",
            "loadingRecords": "Loading...",
            "processing": "Processing...",
            "search": "Procurar:",
            "zeroRecords": "No matching records found",
            "paginate": {
                "first": "Primeira",
                "last": "Ultimo",
                "next": "Seguinte",
                "previous": "Anterior"
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        }
    });

}
window.setQuestionsChart = function (questions, table) {
    var data = [];
    for (var quest = 0; quest < questions.length; quest++) {
        data.push({date: questions[quest].resolutionDate, note: parseFloat(questions[quest].note)})
    }
    console.log(data)

    $(document).ready(function () {
        console.log(questions)
        console.log(table)
        window.graph.push(Morris.Line({
            // ID of the element in which to draw the chart.
            element: table,
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: data,
            // The name of the data record attribute that contains x-values.
            xkey: 'date',
            // A list of names of data record attributes that contain y-values.
            ykeys: ['note'],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ['Nota'],
            parseTime: false
        }));

    });
}

window.setReadingChart = function (questions, table) {
    var data = [];
    for (var quest = 0; quest < questions.length; quest++) {
        //verifica a percentagem de fliudez (nr erros* 100 / nr palavras)
        var fluidity = 100 - ((_.filter(questions[quest].errors, function (error) {
                return error.error == 'fluidity';
            }).length) * 100 / questions[quest].wordsCount) || null;
        var accuracy = 100 - ((_.filter(questions[quest].errors, function (error) {
                return error.error == 'accuracy';
            }).length) * 100 / questions[quest].wordsCount) || null;
        console.log(fluidity)
        console.log(accuracy)
        data.push({
            date: questions[quest].resolutionDate,
            note: parseFloat(questions[quest].note),
            accuracy: accuracy,
            fluidity: fluidity,
            expression: (questions[quest].expression * 100) / 5 || null,
            time: (questions[quest].time * 100) / 5 || null,
        })
    }
    console.log(data)

    $(document).ready(function () {
        console.log(questions)
        console.log(table)
        window.graph.push(Morris.Line({
            // ID of the element in which to draw the chart.
            element: table,
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: data,
            // The name of the data record attribute that contains x-values.
            xkey: 'date',
            // A list of names of data record attributes that contain y-values.
            ykeys: ['note', 'accuracy', 'fluidity', 'expression', 'time'],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: ['Nota', 'Precisão', 'Fluidez', 'Expressividade', 'Tempo'],
            parseTime: false,
            continuousLine: true,
            resize: true

        }));

    });

}
