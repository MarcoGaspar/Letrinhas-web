var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_students),

    Schools = require("./Schools.js"),

    jsonQuery = require('json-query');


var Students = function () {
}

Students.prototype.add = function (data, callback) {
    var self = this;
    self.isUsernameAvailable(data.username.trim().toLowerCase(), function (err, exists) {
        if (err) return callback(err);
        if (!exists) {
            db.insert(data, function (err) {
                if (err) return callback(err);
                console.log('New student was inserted'.green);
                callback(null);
            })
        } else {
            callback('usernameconflit');
        }
    });
};

Students.prototype.getAll = function (callback) {

    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
}

Students.prototype.getByClass = function (idClass, callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            //Obtem os alunos da turma escolhida
            var sList = jsonQuery('rows[doc][*class=' + idClass + ']', {data: body}).value;
            for (var i = 0; i < sList.length; i++) {
                //Remove os campos desnecessarios
                delete sList[i]._rev;
                delete sList[i].password;
            }
            callback(null, sList);
        });
};

Students.prototype.getByTeacher = function (idTeacher, callback) {
    var self = this;
    //Get Teacher Classes
    Schools.getClassesByTeacher(idTeacher, function (err, escolas) {
        if (err) return callback(err);
        //Fetch Students From Classes
        self.getAll(function (err, students) {
            if (err) return callback(err);
            //Filtra os alunos do prof e adiciona a string da escola

            var myStudents = [];
            for (var i = 0; i < students.length; i++) {
                //Remove a password dos campos enviados para a view
                delete students[i].doc.password;
                //Adiciona o campo com o nome da escola e aturma por extenso
                for (var esc in escolas) {
                    for (var classe in escolas[esc].classes) {
                        if (escolas[esc].classes[classe]._id == students[i].doc.class) {
                            students[i].doc.classDetails = escolas[esc].classes[classe].name;
                            students[i].doc.schoolDetails = escolas[esc].name;
                            myStudents.push(students[i].doc)
                        }
                    }
                }
            }
            callback(null, myStudents);
        });
    });
};//*

Students.prototype.getBySchool = function (idSchool, callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            //Obtem os alunos da turma escolhida
            var sList = jsonQuery('rows[doc][*school=' + idSchool + ']', {data: body}).value;
            for (var i = 0; i < sList.length; i++) {
                //Remove os campos desnecessarios
                delete sList[i]._rev;
                delete sList[i].password;
            }
            callback(null, sList);
        });
};

Students.prototype.getById = function (id, callback) {
    var self = this;
    db.get(id, function (err, body) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null, body);
    });
};

Students.prototype.isUsernameAvailable = function (username, callback) {
    var self = this;
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, studentsList) {
            if (err) return callback(err);
            //Verica se o username ja esta em uso
            var student = jsonQuery('rows[doc][*username=' + username + ']', {data: studentsList}).value;

            if (student.length > 0) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        });
};


module.exports = new Students();
