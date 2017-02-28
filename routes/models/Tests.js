require('colors');
var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_tests);

var jsonQuery = require('json-query');

var Tests = function () {
}

Tests.prototype.data = {}

//Returns an array of all schools
Tests.prototype.getAll = function (callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
};

Tests.prototype.getByStudent = function (studentID, callback) {
    var self = this;
    self.getAll(function (err, testsData) {
        if (err) return callback(err);
        //Recolhe os testes do aluno
        var studentTests = jsonQuery('[doc][*studentID=' + studentID + ']', {data: testsData}).value;
        //console.log(studentTests)
        callback(null, studentTests);
    });
};

module.exports = new Tests();
