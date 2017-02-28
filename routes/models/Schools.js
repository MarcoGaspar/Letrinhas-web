require('colors');
var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_schools);

var Schools = function () {
}

Schools.prototype.add = function (data, callback) {
    db.insert(data, function (err) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null);
    });
};

Schools.prototype.delete = function (id, rev, callback) {
    console.log('Removing school')
    db.destroy(id, rev, function (err) {
        if (err) {
            console.log(err)
            callback(err);
        }
        callback(null);
    });
};

/*
 *Gets school by id
 * @param schoolId
 * @param callback
 */
Schools.prototype.getById = function (schoolId, callback) {
    //Search Schools Parameters
    console.log('Getting school by id' + schoolId);
    //gets data
    db.get(schoolId, function (err, body) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null, body);
    });
};

/*
 *Gets schools list
 * @param callback
 */
Schools.prototype.getAll = function (callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
};

/*
 @params idTeacher
 return and object of all schools, and all respective classes
 */
Schools.prototype.getClassesByTeacher = function (idTeacher, callback) {
    var escolas = [];
    this.getAll(function (err, schoolsList) {
        if (err) return callback(err);
        //Search all schools
        for (var school = 0; school < schoolsList.length; school++) {
            var escola = schoolsList[school].doc;
            var classes = {};
            if (JSON.stringify(escola).indexOf(idTeacher) != -1) {
                classes["_id"] = escola._id;
                classes["name"] = escola.name;
                classes["classes"] = [];
                //Search all classes
                for (var turma in escola.classes) {
                    //If professor belongs to that class
                    if (JSON.stringify(escola.classes[turma]).indexOf(idTeacher) != -1) {
                        classes["classes"].push({
                            _id: escola.classes[turma]._id,
                            name: escola.classes[turma].year + "º " + escola.classes[turma].name
                        })
                    }
                }
                escolas.push(classes)
            }
        }
        callback(null, escolas);
    });
};


/*
 *updates school data
 * [data]
 * [data.teacherID] String
 * [data.school] String
 * [data.class] Object
 * @param callback
 */
Schools.prototype.removeTeacherFromClass = function (data, callback) {
    console.log(data)
    var self = this;
    //gets school data
    self.getById(data.school, function (err, schoolData) {
        if (err) return callback(err);
        //Verifica as turmas registadas.
        for (var turma = 0; turma < schoolData.classes.length; turma++) {
            //Quando encontrar uma turma para ser desassociada
            if (schoolData.classes[turma]._id == data.class) {
                //Verifica se já está associada ao professor
                for (var prof = 0; prof < schoolData.classes[turma].profs.length; prof++) {
                    //Se estiver associado, desassocia
                    if (schoolData.classes[turma].profs[prof]._id === data.teacherID) {
                        schoolData.classes[turma].profs.splice(prof, 1);
                        console.log('Class Removed Successfully'.green + data.class);
                        self.update(schoolData._id, schoolData, function (err) {
                            if (err) return callback(err);
                            callback(null);
                        });
                    }
                }
            }
        }
        callback(null);
    });
};

/*
 *updates school data
 * [data]
 * [data.teacherID] String
 * [data.school] String
 * [data.classes] Object
 * @param callback
 */
Schools.prototype.addTeacherToClass = function (data, callback) {
    console.log(data)
    var self = this;
    var existe = false;
    self.getById(data.school, function (err, schoolData) {
        if (err) return callback(err);
        //Verifica as turmas registadas.
        for (var turma in schoolData.classes) {
            //Quando encontrar uma turma para ser associada
            if (data.classes.indexOf(schoolData.classes[turma]._id) != -1) {
                //Verifica se já está associada ao professor
                for (var prof in schoolData.classes[turma].profs) {
                    //Se não estiver associado, associa
                    if (schoolData.classes[turma].profs[prof]._id === data.teacherID) {
                        existe = true;
                    }
                }
                if (!existe) {
                    schoolData.classes[turma].profs.push(
                        {"_id": data.teacherID}
                    );
                } else {
                    console.log(data.teacherID + ", já está associado à turma " + schoolData.classes[turma].year + "º " + schoolData.classes[turma].name);
                }
                existe = false;
            } else {
                console.log(schoolData.classes[turma].profs);
            }
        }
        self.update(schoolData._id, schoolData, function (err) {
            if (err) return callback(err);
            callback(null);
        });
    });
};

/*
 *updates school data
 * [data]
 * [data.name] String
 * [data.address] String
 * [data.b64] String Base 64
 * [data.classes] Object
 * @param callback
 */
Schools.prototype.update = function (id, data, callback) {
    db.insert(data, id, function (err) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null);
    });
};

module.exports = new Schools();
