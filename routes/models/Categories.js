require('colors');
var config = require('../../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_categories);


var Categories = function (data) {
    this.categories = data;
}


Categories.prototype.getAll = function (callback) {
    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
};

Categories.prototype.getById = function (id, callback) {
    //Search School Parameters
    db.get(id, function (err, body) {
        if (err) return callback(err);

        callback(null, body);
    });
};

Categories.prototype.update = function (id, data, callback) {
    db.insert(data, id, function (err) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null);
    });
};

module.exports = new Categories();
