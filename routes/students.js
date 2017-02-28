require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);

var db = nano.use(config.db_students);
var dbTests = nano.use(config.db_tests);
var dbSchools = nano.use(config.db_schools);
var dbResolutions = nano.use(config.db_resolutions);

var jsonQuery = require('json-query');


var Schools = require("./models/Schools.js");
var Students = require('./models/Students.js');
var Tests = require("./models/Tests.js");
var Resolutions = require("./models/Resolutions.js");


exports.getAll = function (req, res) {

    var teacher = req.user.name;
    console.log('getting my students :' + teacher.bgBlue);
    Students.getByTeacher(teacher, function (err, students) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json(students);
    })
};

exports.get = function (req, res) {
    var studentId = req.params.student;
    console.log('student get: '.green + studentId);

    Students.getById(studentId, function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //delete body._id;
        delete body._rev;
        res.status(200).json(body);
    });
};

exports.new = function (req, res) {

    //Verify Fields
    if (JSON.stringify(req.body).indexOf('""') == -1) {
        var data = {
            "school": req.body.school,
            "name": req.body.name,
            "b64": req.body.b64,
            "number": req.body.number,
            "password": req.body.password,
            "username": req.body.username.trim().toLowerCase(),
            "class": req.body.class
        };
        Students.add(data, function (err) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            res.status(200).json({});
        })
    }
    else {
        console.log("Fields Missing");
        return res.status(500).json({
            'result': 'nok',
            'message': 'missingfields'
        });
    }

};

//Verifica se o nome de utilizador ja esta a ser utilizado
exports.exist = function (req, res) {
    Students.isUsernameAvailable(req.body.username, function (err, exists) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.json(exists);
    })
};

exports.getDetails = function (req, res) {
    var id = req.params.id;
    console.log('student get: '.green + id);

    Students.getById(id, function (err, studentData) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        Tests.getByStudent(id, function (err, testsData) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            studentData.unsolvedTests = jsonQuery('[*solved=false]', {data: testsData}).value || [];
            studentData.solvedTests = jsonQuery('[*solved=true]', {data: testsData}).value || [];
            Resolutions.getNotCorrectedByStudent(id, function (err, resolutions) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                //Adiciona-os ao json da view
                studentData.resolutions = resolutions || [];

                //Obtem o nome da escola e da turma
                //Search School Parameters
                dbSchools.get(studentData.school, function (err, school) {
                    if (err) {
                        return res.status(500).json({
                            'result': 'nok',
                            'message': err
                        });
                    }
                    studentData.schoolName = school.name;
                    var classe = jsonQuery('[classes][_id=' + studentData.class + ']', {data: school}).value;
                    studentData.classe = classe.year + "º " + classe.name;
                    res.status(200).json(studentData);
                });

            });
        });

    });
};
//NEW
exports.editStudent = function (req, res) {

    //console.log(req.body);
    console.log(req.params);
    if (JSON.stringify(req.body).indexOf('""') == -1) {
        //Fetch School
        console.log('Edit Student: Fetching Student ' + req.params.id + ''.green);
        //Search School Info
        db.get(req.params.student, function (err, body) {
            if (err) {
                //Report Error (School Doenst Exists)
                console.log("Error Editing Student");
                res.send(err.statusCode, {error: "Aluno Invalido"});
            }
            else {
                body.name = req.body.name;
                body.number = req.body.number;
                body.school = req.body.school;
                body.class = req.body.class;

                if (req.body.b64 != '')
                    body.b64 = req.body.b64;
                db.insert(body, body._id, function (err) {
                    if (err) {
                        //Report Error (Student Doesn't Exists)
                        console.log("Error Editing Student");
                        res.send(err.statusCode, {error: "Aluno Invalido"});
                    }
                    else {
                        console.log("Student Edited");
                        res.send(200, {text: "Os dados do aluno" + body.name + "foram alterados com sucesso!"});
                    }
                });
            }
        });
    }
    else {
        console.log('Parameters Missing');
        res.send(401, {error: "Alguns parametros são de preenchimento obrigatório"});
    }
};

exports.removeStudent = function (req, res) {
    //Fetch Student
    console.log('Remove Student: Fetching Student ' + req.params.student + ''.green);
    //Search Student Info
    db.get(req.params.student, function (err, body) {
        console.log(body);
        if (err) {
            //Report Error (Student Doenst Exists)
            console.log("Error Removing Student");
            return res.status(err.statusCode).json({});
        }
        else {
            db.destroy(body._id, body._rev, function (err) {

                if (err) {
                    //Report Error (Student Doenst Exists)
                    console.log("Error Removing Student");
                    return res.status(err.statusCode).json({});
                }
                else {
                    console.log("Student Removed - Removing tests and resolutions");
                    dbTests.list({
                        'include_docs': true,
                        'limit': undefined,
                        'descending': true
                    }, function (err, solvedTests) {
                        if (err) {
                            return res.status(500).json({
                                'result': 'nok',
                                'message': err
                            });
                        }
                        //Apaga os testes desse aluno
                        var tests = jsonQuery('[doc][*studentID=' + body._id + ']', {data: solvedTests.rows}).value
                        for (var t = 0; t < tests.length; t++) {
                            dbTests.destroy(tests[t]._id, tests[t]._rev, function (err) {

                                if (err) {
                                    console.log("test not Removed".red);
                                }
                                else {
                                    console.log(t + 1 + "test Removed".green);
                                }
                            });
                        }
                        console.log("Tests Removed");
                        dbResolutions.list({
                            'include_docs': true,
                            'limit': undefined,
                            'descending': true
                        }, function (err, resolutions) {
                            if (err) {
                                return res.status(500).json({
                                    'result': 'nok',
                                    'message': err
                                });
                            }
                            //Apaga os testes desse aluno
                            var resol = jsonQuery('[doc][*studentID=' + body._id + ']', {data: resolutions.rows}).value
                            for (var r = 0; r < r.length; t++) {
                                dbTests.destroy(resol[r]._id, resol[r]._rev, function (err) {

                                    if (err) {
                                        console.log("resolution not Removed".red);
                                    }
                                    else {
                                        console.log(t + 1 + "resolution Removed".green);
                                    }
                                });
                            }
                            console.log("Resolutions Removed");
                            return res.status(200).json({});
                        })
                    })
                }
            });
        }
    });


};
