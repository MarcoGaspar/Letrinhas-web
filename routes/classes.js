require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use('let_schools');
var dbAlunos = nano.use('let_students');

exports.new = function (req, res) {


};

exports.getBySchool = function (req, res) {


};
exports.getByTeacher = function (req, res) {


};
//NEW
exports.addProfClass = function (req, res) {


};

exports.removeProfClass = function (req, res) {


};

exports.newClass = function (req, res) {

    //Fetch School
    console.log('Adding new class'.green);
    console.log(req.body)
    if (req.body.name && req.body.year) {
        var presentYear = new Date().getFullYear();

        db.get(req.params.id, function (err, body) {

            if (err) {
                res.send(err.statusCode, {error: "Erro ao procurar escola"});
            }
            else {

                //Generate New Class Skeleton
                var newClass = {
                    _id: "T" + presentYear + req.body.year + new Date().getTime() + (body.classes.length + 1),
                    name: req.body.name,
                    //Pass it to integer
                    year: parseInt(req.body.year),
                    scholarYear: presentYear,
                    profs: []
                };

                //Add New Class Skeleton to School
                body.classes.push(newClass);

                //Update School
                db.insert(body, body._id, function (err) {
                    if (err) {
                        res.send(err.statusCode, {error: "Erro ao inserir turma na escola"});
                    }
                    else {
                        console.log('New class was inserted into the school'.green);
                        res.status(200).json({});
                    }
                });

            }

        });
    } else {
        console.log('Parameters Missing');
        res.send(401, {error: "Alguns parametros são de preenchimento obrigatório"});
    }


}

exports.removeClass = function (req, res) {

    //Fetch School
    console.log('Removing a class'.green);
    console.log(req.body)

    dbAlunos.list({
        'include_docs': true, 'attachments': true,
        'limit': undefined, 'descending': false
    }, function (err, students) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Se a turma a ser apagada não possuir alunos
        if (JSON.stringify(students.rows).indexOf(req.body._id) == -1) {
            db.get(req.params.id, function (err, body) {

                if (err) {
                    //Report Error (School Doenst Exists)
                    res.send(err.statusCode, {error: "Erro ao procurar escola"});
                }
                else {
                    //Search For The Correct Class
                    for (var c in body.classes) {

                        //Remove Class
                        if (body.classes[c]._id == req.body._id) {
                            body.classes.splice(c, 1);
                        }
                    }
                    //Update School
                    db.insert(body, body._id, function (err) {
                        if (err) {
                            res.send(err.statusCode, {error: "Erro ao apagar turma da escola"});
                        }
                        else {
                            console.log('Class Removed Successfully'.green);
                            res.status(200).json({});
                        }
                    });
                }
            });
        } else {
            return res.status(403).json({
                'result': 'A turma seleccionada tem alunos associados e não pode ser apagada.'
            });
        }
    });


};
