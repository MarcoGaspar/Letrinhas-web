require('colors');
var request = require('request');
var config = require('../config.js');

console.log('from fileHandler');
console.log(config.dbserver);
exports.fileDownload = function (req, res) {

    var id = req.params.id;
    var db = req.params.db;
    var photo = req.params.filename;

    request({
        'url': dbserver + '/' + db + '/' + id + '/' + photo, headers: {
            "Authorization": "Basic " + new Buffer(config.dbuser + ":" + config.dbpass).toString("base64")
        }
    }).pipe(res);


};
