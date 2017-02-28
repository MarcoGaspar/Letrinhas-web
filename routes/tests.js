require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_tests);
var jsonQuery = require('json-query');

exports.upDate = function (req, res) {

};

exports.newGeneric = function (req, res) {
    console.log(req.body)

    //Verify Fields
    if (JSON.stringify(req.body).indexOf('""') == -1) {
        var dati = new Date();
        var id = 'T' + dati.getTime();
        //Creates a tes obj
        var test = {
            "title": req.body.title,
            "generic": true,
            "subject": [req.body.subject, req.body.content, req.body.specification].join(':'),
            "schoolYear": parseInt(req.body.schoolYear),
            "questions": req.body.questions,
            "profID": req.params.userID
        };

        db.insert(test, function (err) {
            if (err)
                return res.status(err.statusCode).json({});
            else {
                console.log('New test was inserted'.green);
                res.status(200).json({});
            }
        })
    }
    else {
        console.log("Fields Missing");
        res.send(401, {result: "Todos os campos sao de preenchimento obrigatório"});
    }
};
exports.new = function (req, res) {
    console.log(req.body)
    var user = req.params.userID;
    //Verify Fields
    if (JSON.stringify(req.body).indexOf('""') == -1) {

        //Creates a tes obj
        var test = req.body;
        test.profID = user;
        test.note = -1;
        test.solved = false;
        test.generic = false;
        //Separa o d-m-a, inverte-o para a-m-d e transforma-o em timestamp
        test.beginDate = new Date(test.beginDate.split("-").reverse().join("-")).getTime();
        test.endDate = new Date(test.endDate.split("-").reverse().join("-")).getTime();
        db.insert(test, function (err) {
            if (err)
                return res.status(err.statusCode).json({});
            else {
                console.log('New test was associated'.green);
                res.send(200, {result: "Teste associado com sucesso!"});
            }
        })
    }
    else {
        console.log("Fields Missing");
        res.send(401, {result: "Todos os campos sao de preenchimento obrigatório"});
    }

};

exports.get = function (req, res) {
  console.log('marco');
  console.log(req.params);
  var id = req.params.id;
  console.log('one question get'.green);

  db.get(id, function (err, body) {
      if (err) {
          console.log('ERRO!:'.red);
          console.log(err);
          return res.status(500).json({
              'result': 'nok',
              'message': err
          });
      }
      console.log(body);
      res.json(body);
  });

};

exports.delete = function (req, res) {
    //verifica se o teste nao esta a ser utilizado em nenhum otro teste
    var user = req.params.userID;
    db.get(req.params.id, function (err, testData) {
        if (err) {
            //Report Error (Student Doenst Exists)
            console.log("Error Removing test");
            console.log(err.statusCode);
            res.send(401, {result: "Não foi possível remover o teste."});
        }
        else {
            console.log(testData);
            //Se o teste é da minha autoria
            if (testData.profID == user) {
                db.destroy(testData._id, testData._rev, function (err) {

                    if (err) {
                        //Report Error (Student Doenst Exists)
                        console.log("Error Removing test");
                        return res.status(err.statusCode).json({});
                    }
                    else {
                        console.log("question Removed");
                        res.send(200, {result: "Teste eliminado com sucesso."});

                    }

                });
            } else {
                res.send(401, {result: "Apenas o autor deste teste (" + testData.profID + ") a pode eliminar."});

            }


        }

    })
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
        //console.log(body.rows)
        res.json(jsonQuery('[doc][*generic=true]', {data: body.rows}).value);
    });

};
