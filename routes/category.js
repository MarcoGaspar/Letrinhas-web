require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_categories);
Categories = require("./models/Categories.js")

//Get category by ID
exports.get = function (req, res) {

    var id = req.params.id;
    Category.getById(id, function (err, category) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json(category);

    });
};

exports.new = function (req, res) {
    console.log(req.params);
    console.log(req.body);
    //Check For Required Fields
    if (req.params.id) {

        var category = {

            "content": "",
            "subject": req.params.id

        }
        var id = "NEW|Escola" + new Date().getTime();
        db.insert(category, function (err) {
            if (err)
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            else {
                console.log('New school was inserted'.green);

                res.status(200).json([category]);
            }
        })

    }
    else {
        console.log('Required Arguments Missing'.green);
        res.status(406).json({});
    }


};

exports.addContent = function (req, res) {

    var idSubject = req.params.subject;

    if (req.body.content) {
        var presentYear = new Date().getFullYear();
        Categories.getById(idSubject, function (err, data) {
            if (err) {
                return res.status(500).json({
                    'result': 'nok',
                    'message': err
                });
            }
            //Generate New Class Skeleton
            var newContent = {
                _id: "C" + presentYear + new Date().getTime() + (data.content.length + 1),
                name: req.body.content,
                specification: []
            };
            //Add New Class Skeleton to School
            data.content.push(newContent);
            Categories.update(idSubject, data, function (err) {
                if (err) {
                    return res.status(500).json({
                        'result': 'nok',
                        'message': err
                    });
                }
                res.status(200).json({});
            });
        });
    } else {
        console.log('Parameters Missing');
        res.send(401, {error: "Alguns parametros são de preenchimento obrigatório"});
    }

};

exports.addSpecif = function (req, res) {

    console.log(req.body);
    console.log('Adding specification: '.green + req.body);

    var idSubject = req.params.subject;
    var idContent = req.params.content;

    if (!req.body.specification) {
        console.log('Parameters Missing');
        return res.status(500).json({error: "Alguns parametros são de preenchimento obrigatório"});
    }
    var newId = new Date().getTime();
    //Search category Parameters
    Categories.getById(idSubject, function (err, data) {
            if (err) {
                console.log("Especificação não inserida");
                return res.status(400).json({});
            } else {
                //percorre a categoria ate encontrar o conteudo desejado e adiciona a nova especificacao
                for (var i = 0; i < data.content.length; i++) {
                    console.log(i)
                    if (data.content[i]._id == idContent) {
                        data.content[i].specification.push({
                            _id: 'E' + newId + data.content.length,
                            name: req.body.specification
                        });
                        //insere na bd
                        Categories.update(idSubject, data, function (err) {
                            if (err) {
                                console.log("Especificação não inserida");
                                return res.send(200, {text: "Especificação não inserida."});
                            }
                              return res.send(200, {text: "Especificação inserida."});
                        })
                    }
                }
                console.log("Especificação inserida");
                return res.send(200, {text: "Especificação inserida."});
            }
        }
    );
};

exports.getAll = function (req, res) {
    console.log('category getAll'.yellow);
    Categories.getAll(function (err, categories) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.status(200).json(categories);
    });

};

exports.removeSpecif = function(req,res) {


  console.log('Remove Student: Fetching Student ' + req.params.id + ''.green);
  var idSubject = req.params.subject;
  var idContent = req.params.content;
  var toRemove  = req.params.id;



  Categories.getById(idSubject, function (err, data) {
          if (err) {
              console.log("Especificação não removida");
              return res.status(400).json({});
          } else {

              //percorre a categoria ate encontrar o conteudo desejado e adiciona a nova especificacao
              for (var i = 0; i < data.content.length; i++) {

                  if (data.content[i]._id == idContent) {

                    for (var j = 0; j < data.content[i].specification.length; j++) {

                        if (data.content[i].specification[j]._id == toRemove) {

                          data.content[i].specification.splice(j,1);

                          if(data.content[i].specification.length==0){

                            data.content.splice(i,1);
                            Categories.update(idSubject, data, function (err) {
                                if (err) {

                                return  res.send(400, {text: "Ocorreu um erro."});
                                }
                                return res.send(200, {text: "Especificação removida."});
                            })
                            break;
                          }

                          Categories.update(idSubject, data, function (err) {
                              if (err) {

                                return   res.send(400, {text: "Ocorreu um erro."});
                              }
                            return  res.send(200, {text: "Especificação removida."});
                          })
                            break;
                        }
                    }
                      break;
                  }
              }
          }
      }  );
      return res.send(200, {text: "ERROR."});
};
