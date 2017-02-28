require('colors');
var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_resolutions);

var jsonQuery = require('json-query');

var Resolutions = function () {
}

Resolutions.prototype.getAll = function (callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
};
Resolutions.prototype.getNotCorrectedByStudent = function (studentID, callback) {
    this.getAll(function (err, resolData) {
        if (err) return callback(err);
        //Recolhe as resolucoes do aluno
        var resolutions = jsonQuery('[doc][*studentID=' + studentID + '& note != -1]', {data: resolData}).value;
        //else sends fetched data
        callback(null, resolutions);
    });
};

module.exports = new Resolutions();
