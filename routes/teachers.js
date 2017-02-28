require('colors');
var request = require('request');
var config = require('../config.js');

var nano = require('nano')(config.dbserver);


var Teachers = require('./models/Teachers.js');
var Schools = require('./models/Schools.js');
var Students = require('./models/Students.js');

var db = nano.use(config.db_teachers);
var db2 = nano.use(config.db_schools);

nano.auth(config.dbuser, config.dbpass, function (err, response, headers) {
    nano = require('nano')({
        url: config.dbserver,
        cookie: headers['set-cookie']
    });
    db = nano.use(config.db_teachers);
    db2 = nano.use(config.db_schools);
});


exports.addToClass = function (req, res) {
    var escolas = JSON.parse(req.body.classes);
    var data = {
        teacherID: req.params.teacher
    }
    for (var items in escolas) {
        data.school = escolas[items].id;
        data.classes = escolas[items].classes;
        Schools.addTeacherToClass(data, function (err) {
            if (err) {
                console.log("not found")
                return res.status(204).json({
                    'result': 'nok',
                    'message': err
                });
            }
        });
    }
    res.status(200).json({});
};//*

exports.get = function (req, res) {
    var idTeacher = req.params.teacher || req.user.name;
    console.log('teacher get: '.green + idTeacher);
    Teachers.getById(idTeacher, function (err, body) {
        if (err) {
            console.log("not found")
            return res.status(204).json({
                'result': 'nok',
                'message': err
            });
        }
        //Remove Sensitive Information
        delete body._rev;
        delete body.password;
        delete body.pin;

        //gets schools and classes
        Schools.getClassesByTeacher(idTeacher, function (err, escolas) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            body.schools = escolas;
            //Return Result
            res.json(body);
        })
    });
};//*

exports.getAll = function (req, res) {
    console.log('teachers getAll'.yellow);

    Teachers.getAll(function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json(body);
    });
};//*


//Função para desassociar professores às turmas
exports.removeFromClass = function (req, res) {

    var data = {
        teacherID: req.params.teacher,
        school: req.body.school,
        class: req.body.class
    }
    Schools.removeTeacherFromClass(data, function (err) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json({});
    })
};//*

exports.editDetails = function (req, res) {
    //Verify Fields
    var idTeacher = req.params.teacher;
    if (JSON.stringify(req.body).indexOf('""') == -1) {
        Teachers.getById(idTeacher, function (err, data) {
            if (err) {
                //Report Error (School Doenst Exists)
                console.log("Error Editing Student");
                res.send(err.statusCode, {error: "Aluno Invalido"});
            }
            var state = false;

            if (req.body.state == 1) {
                data.state = true;
            }
            data.name = req.body.name;
            data.phoneNumber = req.body.phoneNumber;
            data.type = req.body.type;
            data.state = state;
            data.b64 = req.body.b64;

            Teachers.update(idTeacher, data, function (err) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                res.status(200).json({});
            });
        });

    } else {
        return res.status(500).json({
            'result': "Campos em falta"
        });
    }
};//*?* differ admin edit and user edit

exports.new = function (req, res) {
    //Verify Fields
    if (JSON.stringify(req.body).indexOf('""') == -1) {

        var data = {
            "_id": req.body.email,
            "state": true,
            "name": req.body.name,
            "password": req.body.password,
            "pin": req.body.pin,
            "phoneNumber": req.body.phoneNumber,
            "permissionLevel": parseInt(req.body.permissionLevel),
            "b64": req.body.b64,
        };

        Teachers.add(data, function (err) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            res.status(200).json({});
        });
    }
    else {
        console.log("Fields Missing");
        return res.status(500).json({
            'result': 'nok',
            'message': 'missingfields'
        });
    }


};//*

exports.editPasswd = function (req, res) {
    console.log('Teachers - UPDATE'.cyan);
    console.log(req.body);
    //começo do upDate...
    db.get(req.body.id, function (err, body) {
        if (err) {
            console.log("(L-20) - Não foi possivel aceder a " + req.body.id + '\n'
                + "erro: " + err);
            res.redirect('/teachers');
        }
        //Se a palavara passe antiga estver correcta
        if (body.password == req.body.oldPswd) {
            body.password = req.body.newPswd;
            db.insert(body, req.body.id, function (err, body) {
                if (err) {
                    console.log("(L-131) - Não foi possivel alterar a passord de: " + req.body.id + '\n' + "erro: " + err);
                    return res.status(500).json({
                        'result': 'Não foi possivel alterar a passord'
                    });
                }
                else {
                    res.json(body);
                    console.log('Password alterada'.green + ':' + req.body.id);
                }
            });
        } else {
            return res.status(500).json({
                'result': 'Password antiga incorrecta'
            });
            console.log("Não foi possivel alterar a password.\n" + "erro: " + err);
        }

    });
};//*

exports.delete = function (req, res) {
    var idTeacher = req.params.teacher;
    //Doesnt allow delete itself
    if (req.user.name == idTeacher) {
        return res.status(500).json({
            'result': 'nok',
            'message': 'cant delete yourself'
        });
    }
    Teachers.getById(idTeacher, function (err, teacherData) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Search School Info
        Teachers.delete(idTeacher, teacherData._rev, function (err) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            console.log("School Removed");
            return res.status(200).json({});

        });
    });
};//*



exports.getMyData = function (req, res) {
    var idTeacher = req.params.userID;
    console.log('getting my data :' + idTeacher.bgBlue);
    db.get(idTeacher, function (err, body) {
        if (err) {
            console.log("not found")
            return res.status(204).json({
                'result': 'nok',
                'message': err
            });
        }
        //Remove Sensitive Information
        delete body._rev;
        delete body.password;
        delete body.pin;


        //gets schools ans classes
        //gets schools and classes
        Schools.getClassesByTeacher(idTeacher, function (err, escolas) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            body.schools = escolas;
            Students.getByTeacher(idTeacher, function (err, students) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                body.students = students;
                //Return Result
                res.json(body);
            });
        })

    });
};

//Returns an array of all classes teached by some professor
function getClasses(schools, idProf) {
    console.log("getting classes".green)
    var profClasses = [];

    //Search all schools
    for (var school = 0; school < schools.rows.length; school++) {
        var escola = schools.rows[school].doc;
        var classes = {};
        if (JSON.stringify(escola).indexOf(idProf) != -1) {
            classes["_id"] = escola._id;
            classes["name"] = escola.name;
            classes["class"] = [];
            //Search all classes
            for (var turma in escola.classes) {
                //If professor belongs to that class
                if (JSON.stringify(escola.classes[turma]).indexOf(idProf) != -1) {
                    classes["class"].push({
                        _id: escola.classes[turma]._id,
                        name: escola.classes[turma].year + "º " + escola.classes[turma].name
                    })
                }
            }
            profClasses.push(classes)
        }
    }
    console.log(profClasses)
    return profClasses;
}

//Função para associar professores às turmas
function insertProfTurma(idProf, escola, turmas) {
    var existe = false;
    if (idProf && escola && turmas) {
        //Obtem os dados da escola
        db2.get(escola, function (err, schoolData) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            else {
                //Verifica as turmas registadas.
                for (var turma in schoolData.classes) {
                    //Quando encontrar uma turma para ser associada
                    if (turmas.indexOf(schoolData.classes[turma]._id) != -1) {
                        //Verifica se já está associada ao professor
                        for (var prof in schoolData.classes[turma].profs) {
                            //Se não estiver associado, associa
                            if (schoolData.classes[turma].profs[prof]._id === idProf) {
                                existe = true;
                            }
                        }
                        if (!existe) {
                            schoolData.classes[turma].profs.push(
                                {"_id": idProf}
                            );
                        } else {
                            console.log(idProf + ", já está associado à turma " + schoolData.classes[turma].year + "º " + schoolData.classes[turma].name);
                        }
                        existe = false;
                    } else {
                        console.log(schoolData.classes[turma].profs);
                    }
                }
            }
            db2.insert(schoolData, schoolData._id);

        });
    }

};

function removeProfTurma(id, school, classe, res) {
    console.log(id, school, classe)
    db2.get(school, function (err, schoolData) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Verifica as turmas registadas.
        for (var turma = 0; turma < schoolData.classes.length; turma++) {
            //Quando encontrar uma turma para ser desassociada
            if (schoolData.classes[turma]._id == classe) {
                //Verifica se já está associada ao professor
                for (var prof = 0; prof < schoolData.classes[turma].profs.length; prof++) {
                    //Se estiver associado, desassocia
                    if (schoolData.classes[turma].profs[prof]._id === id) {
                        schoolData.classes[turma].profs.splice(prof, 1);
                        console.log('Class Removed Successfully'.green + classe);
                        db2.insert(schoolData, schoolData._id);
                        res.status(200).json({});
                    }
                }
            }
        }


    });
}

function sortJsonByCol(property) {

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
