var jsonQuery = require('json-query');

var Schools = require("./models/Schools.js");
var Students = require('./models/Students.js');

exports.editSchool = function (req, res) {
    var idSchool = req.params.school;
    Schools.getById(idSchool, function (err, data) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //sets new data
        data.name = req.body.name;
        data.address = req.body.address;
        data.b64 = req.body.b64;
        //saves it
        Schools.update(idSchool, data, function (err) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            res.status(200).json({});
        });
    });
};//

exports.get = function (req, res) {

    var schoolId = req.params.school;
    Schools.getById(schoolId, function (err, body) {
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
};//*

exports.getAll = function (req, res) {

    Schools.getAll(function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json(body);
    });
};//*

exports.getClassInfo = function (req, res) {

    var idSchool = req.params.school;
    var idClass = req.params.class;

    Schools.getById(idSchool, function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //delete body._id;
        delete body._rev;
        delete body._attachments;

        //Obtem os dados da turma
        body = jsonQuery('[classes][_id=' + idClass + ']', {data: body}).value;

        Students.getByClass(idClass, function (err, students) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            body.students = students;
            res.status(200).json(body);
        })
    });
};//*

exports.new = function (req, res) {
    if (req.body.name && req.body.address && req.body.b64) {
        var presentYear = new Date().getFullYear();
        var school = {
            "name": req.body.name,
            "address": req.body.address,
            "classes": [],
            "b64": req.body.b64
        }
        for (var i = 0; i < req.body.classes.length; i++) {
            //Generate New Class Skeleton
            var newClass = {
                _id: "T" + presentYear + req.body.classes[i].year + new Date().getTime() + i,
                name: req.body.classes[i].name,
                year: req.body.classes[i].year,
                scholarYear: presentYear,
                profs: []
            };

            //Add New Class Skeleton to School
            school.classes.push(newClass);
        }
        Schools.add(school, function (err) {
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
        console.log('Required Arguments Missing'.green);
        res.status(406).json({});
    }
};//*

exports.addClass = function (req, res) {

    var idSchool = req.params.school;

    if (req.body.name && req.body.year) {
        var presentYear = new Date().getFullYear();
        Schools.getById(idSchool, function (err, data) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            //Generate New Class Skeleton
            var newClass = {
                _id: "T" + presentYear + req.body.year + new Date().getTime() + (data.classes.length + 1),
                name: req.body.name,
                year: parseInt(req.body.year),
                scholarYear: presentYear,
                profs: []
            };
            //Add New Class Skeleton to School
            data.classes.push(newClass);
            Schools.update(idSchool, data, function (err) {
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
        console.log('Parameters Missing');
        res.send(401, {error: "Alguns parametros são de preenchimento obrigatório"});
    }


};//*

exports.removeClass = function (req, res) {

    var idSchool = req.params.school;
    var idClass = req.params.class;

    Students.getByClass(idClass, function (err, studentsData) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }

        //Se a turma a ser apagada não possuir alunos
        if (studentsData.length == 0) {
            Schools.getById(idSchool, function (err, schoolData) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                //Search For The Correct Class
                for (var c in schoolData.classes) {
                    //Remove Class
                    if (schoolData.classes[c]._id == idClass) {
                        schoolData.classes.splice(c, 1);
                    }
                }
                //saves it
                Schools.update(idSchool, schoolData, function (err) {
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
            return res.status(403).json({
                'result': 'A turma seleccionada tem alunos associados e não pode ser apagada.'
            });
        }
    });
};//*

exports.removeSchool = function (req, res) {

    var idSchool = req.params.school;
    var idClass = req.params.class;

    Students.getBySchool(idSchool, function (err, studentsData) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }

        //Se a escola a ser apagada não possuir alunos
        if (studentsData.length == 0) {
            //Search School Info
            Schools.getById(idSchool, function (err, schoolData) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                //Search School Info
                Schools.delete(idSchool, schoolData._rev, function (err) {
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

        } else {
            return res.status(403).json({
                'result': 'A escola seleccionada tem alunos associados e não pode ser apagada.'
            });
        }
    });
};//*

