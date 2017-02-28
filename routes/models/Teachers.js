var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_teachers),

    Schools = require("./Schools.js"),

    jsonQuery = require('json-query');


var Teachers = function () {
}

Teachers.prototype.add = function (data, callback) {
    var self = this;
    self.isEmailAvailable(data._id, function (err, isAvailable) {
        if (err) return callback(err);
        if (isAvailable) {
            db.insert(data, function (err) {
                if (err) return callback(err);
                console.log('New teacher was inserted'.green);
                callback(null);
            })
        } else {
            callback('usernameconflit');
        }
    });
};


/*
 *Gets teacher by id
 * @param teacherId
 * @param callback
 */
Teachers.prototype.getById = function (teacherId, callback) {
    //Search Schools Parameters
    //console.log('Getting teacher by id' + teacherId);
    //gets data
    db.get(teacherId, function (err, body) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null, body);
    });
};

/*
 *Gets teacher by id
 * @param teacherId
 * @param callback
 */
Teachers.prototype.delete = function (teacherId, rev, callback) {
    console.log('Removing school')
    db.destroy(teacherId, rev, function (err) {
        if (err) {
            console.log(err)
            callback(err);
        }
        callback(null);
    });
};

/*
 *Gets teacher by id
 * @param email
 * @param callback
 */
Teachers.prototype.isEmailAvailable = function (email, callback) {
    var self = this;
    console.log(email)
    db.get(email, function (err, teacher) {
        if (err) return callback(null, true);
        callback(null, false);
    });
};

/*
 *updates teacher data
 * [data]
 * [data.name] String
 * [data.phoneNumber] String
 * [data.type] String
 * [data.state] String
 * [data.phoneNumber] String
 * [data.b64] String Base 64
 * @param callback
 */
Teachers.prototype.update = function (id, data, callback) {
    db.insert(data, id, function (err) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null);
    });
};

Teachers.prototype.getAll = function (callback) {

    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
}


module.exports = new Teachers();
