require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_testtype);
var jsonQuery = require('json-query');
exports.upDate = function (req, res) {

};

exports.new = function (req, res) {
    console.log(req.body)

    //Verify Fields
    if (JSON.stringify(req.body).indexOf('""') == -1) {
        var dati = new Date();
        //Creates a tes obj
        var type = {
            "_id": 'TT' + dati.getTime(),
            "description": req.body.description,
            "value": req.body.value
        };

        db.insert(type, (req.body.description).replace(/\s+/g, '') + dati, function (err) {
            if (err)
                return res.status(err.statusCode).json({});
            else {
                console.log('New test type was inserted'.green);
                res.status(200).json({});
            }
        })
    }
    else {
        console.log("Fields Missing");
        res.send(401, {result: "Todos os campos sao de preenchimento obrigatório"});
    }
};


exports.get = function (req, res) {


};

exports.getAll = function (req, res) {

    console.log('Getting all tests'.blueBG + ' : ' + req.params.userID.blue);

    db.list({
        'include_docs': true, 'attachments': true,
        'limit': undefined, 'descending': false
    }, function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Devlve o doc de cada row
        res.json(jsonQuery('rows.doc', {data: body}).value);
    });

};
