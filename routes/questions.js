require('colors');
var config = require('../config.js');
//DB Info
var nano = require('nano')(config.dbserver);
var dbQuest = nano.use(config.db_questions);
var dbTests = nano.use(config.db_tests);
var jsonQuery = require('json-query');


var fs = require('fs-extra'),       //File System - for file manipulation
    mime = require('mime');

//Como as perguntas nuca se poderão alterar
//usa-se o upDate apenas para desabilitar a pergunta
exports.upDate = function (req, res) {


    //If there's any empty field, stops right here
    if (JSON.stringify(req.body).indexOf('""') != -1) {
        console.log('Required Arguments Missing'.green);
        return res.status(406).json({
            'result': 'Campos em falta'
        });
    } else {
        dbQuest.get(req.params.id, function (err, body) {
            if (err) {
                console.log("Não foi possivel aceder a " + req.params['id'] + '\n'
                    + "erro: " + err);
                return res.status(err.statusCode).json({});
            }
            console.log(body)
            //If the teacher trying to edit isn't the author of the question, stops right here
            if (req.params.userID != body.profID) {
                console.log("You shall not pass!You have no permissions.".red);
                return res.status(403).json({
                    'result': 'Apenas o criador da pergunta (' + body.profID + ') tem permissões para a alterar.'
                });

            } else {
                body.title = req.body.title;
                body.subject = [req.body.subject, req.body.content, req.body.specification].join(':');
                body.schoolYear = parseInt(req.body.schoolYear);
                body.question = req.body.question;
                body.content = {};
                body.state = Boolean(req.body.state);


                switch (body.type) {
                    case "text":
                        body.content["text"] = req.body.text;
                        body.content["wordTimes"] = JSON.parse(req.body.wordTimes);
                        break;

                    case "list":
                        //Remmove as palavras vazias
                        body.content["columns"] = JSON.parse(req.body.columns.replace(/,""/gi, ''));
                        body.content["wordTimes"] = JSON.parse(req.body.wordTimes);
                        break;

                    case "interpretation":
                        //Content Text
                        body.content["text"] = req.body.text;

                        //Iterate SID's
                        body.content["sid"] = [];
                        var $sid = req.body.sid.split(',');
                        for (var i in $sid) {
                            body.content.sid.push($sid[i]);
                        }

                        break;
                    case "multimedia":
                        console.log(JSON.parse(req.body.answers));
                        body.content["questionType"] = req.body.questionType;
                        body.content["answerType"] = req.body.answerType;
                        //Se a pegunta nao for do tipo audio (imagem ou texto
                        if (req.body.questionType != "audio") {
                            body.content["question"] = req.body.contentQuest;
                        }
                        body.content["answers"] = JSON.parse(req.body.answers);
                        break;
                    case "boxes":
                        body.content["boxes"] = JSON.parse(req.body.boxes.replace(/,""/gi, ''));
                        break;
                    case "whitespaces":
                        /*  //Content Text
                         body.content["text"] = req.body.text;

                         //Iterate SID's
                         body.content["sid"] = [];
                         var $sid = req.body.sid.split(',');
                         for (var i in $sid) {
                         body.content.sid.push($sid[i]);
                         }
                         */
                        break;
                    default:
                        break;
                }

                //Check if ther's a file and if its a MP3 File
                if ((req.body.filePath) && (mime.lookup(req.body.filePath)).startsWith("audio")) {
                    //Image Data Sync
                    var $imgData = fs.readFileSync(req.body.filePath);
                    //Inserts new document with attachment
                    dbQuest.multipart.insert(body, [{
                        name: 'voice.mp3',
                        data: $imgData,
                        content_type: 'audio/mp3'
                    }], body._id, function (err, body) {
                        if (err) {
                            console.log('questions new, an error ocourred'.green);
                            return res.send(500, {text: "Não foi possível alterar a pergunta!"});
                        }
                        else {
                            console.log('Question edited (with sound)'.red);
                            res.send(200, {text: "Pergunta alterada com sucesso!"});
                        }
                    });
                    //Inserts new document without attachment
                } else {
                    dbQuest.insert(body, body._id, function (err, body) {
                        if (err) {
                            console.log('questions edit, an error ocourred'.yellow);
                            res.send(500, {text: "Não foi possível alterar a pergunta!"});

                        }
                        else {
                            console.log('Questions successful edited (no sound)'.green);
                            res.send(200, {text: "Pergunta alterada com sucesso!"});
                        }
                    });
                }
                console.log("Edited Question");

            }

        });
    }
};

exports.getAll = function (req, res) {
    console.log('all questions'.green);

    dbQuest.list({'include_docs': true, 'limit': undefined, 'descending': true}, function (err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        res.json(body.rows);

    });
};

exports.get = function (req, res) {
    var id = req.params.id;
    console.log('one question get'.green);

    dbQuest.get(id, function (err, body) {
        if (err) {
            console.log('ERRO!:'.red);
            console.log(err);
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }

        res.json(body);
    });
};

exports.clone = function (req, res) {
    var id = req.params.id;

    console.log('one question get'.green);

    console.log(req.body);




};

exports.test = function (req, res) {

    //If there's any empty field, stops right here
    console.log(req.body.wordTimes)
    if (JSON.stringify(req.body).indexOf('""') != -1) {

        console.log('Required Arguments Missing'.green);
        return res.status(406).json({
            'result': 'Campos em falta'
        });
    } else {
        //Date And ID's Generator
        var $date = new Date();
        var $idQuest = 'Q' + $date.getTime();


        console.log(req.body)
        console.log("----------------")
        //Test Question
        var $question = {
            "title": req.body.title,
            "subject": req.body.subject + ":" + req.body.content + ":" + req.body.specification,
            "schoolYear": parseInt(req.body.schoolYear),
            "question": req.body.question,
            "content": {},
            "state": Boolean(req.body.state),
            "type": req.body.type,
            "profID": req.params.userID,
            "creationDate": $date
        };
        console.log($question)
        //Select Question Type
        switch ($question.type) {
            case "text":
                $question.content["text"] = req.body.text;
                $question.content["wordTimes"] = JSON.parse(req.body.wordTimes);
                break;

            case "list":
                $question.content["columns"] = JSON.parse(req.body.columns.replace(/,""/gi, ''));
                $question.content["wordTimes"] = JSON.parse(req.body.wordTimes);
                break;

            case "interpretation":
                //Content Text (Não esquecer os PARAGRAFOS)
                $question.content["text"] = req.body.text.replace(/(\r\n)/gm, "\n").replace(/(\n|\r)/gm, "\n");

                //Iterate SID's
                $question.content["sid"] = [];
                var $sid = req.body.sid.split(',');
                for (var i in $sid) {
                    $question.content.sid.push($sid[i]);
                }

                break;
            case "multimedia":
                //Obtem o tipo de pergunta e o tipo de resposta
                $question.content["questionType"] = req.body.questionType;
                $question.content["answerType"] = req.body.answerType;
                //Se a pegunta nao for do tipo audio (imagem ou texto
                if (req.body.questionType != "audio") {
                    $question.content["question"] = req.body.contentQuest;
                }
                $question.content["answers"] = JSON.parse(req.body.answers);
                break;
            case "boxes":
                $question.content["boxes"] = JSON.parse(req.body.boxes.replace(/,""/gi, ''));
                for (var i in  $question.content.boxes) {
                    //Adiciona um id a lista
                    $question.content.boxes[i]._id = i;
                }
                break;
            case "whitespaces":
                console.log(req.body.text)
                //Content Text
                $question.content["text"] = req.body.text.replace(/\. \n/gi, ".").replace(/\! \n/gi, "!").replace(/\? \n/gi, "?");

                //Iterate SID's
                $question.content["sid"] = JSON.parse(req.body.sid);


                break;
            default:
                break;
        }

        //Check if ther's a file and if its a MP3 File
        if ((req.body.filePath) && (mime.lookup(req.body.filePath)).startsWith("audio")) {
            //Image Data Sync
            var $imgData = fs.readFileSync(req.body.filePath);
            //Inserts new document with attachment
            dbQuest.multipart.insert($question, [{
                name: 'voice.mp3',
                data: $imgData,
                content_type: 'audio/mp3'
            }], $idQuest, function (err, body) {
                if (err) {
                    console.log('questions new, an error ocourred'.green);
                    res.send(500, {text: "Não foi possível inserir a pergunta!"});
                }
                else {
                    console.log('New question Added (With sound)'.red);
                    res.send(200, {text: "Pergunta inserida com sucesso!"});
                }
            });
            //Inserts new document without attachment
        } else {
            dbQuest.insert($question, $idQuest, function (err, body) {
                if (err) {
                    console.log('questions new, an error ocourred'.yellow);
                    res.send(500, {text: "Não foi possível inserir a pergunta!"});

                }
                else {
                    console.log('New question Added (No sound)'.red);
                    res.send(200, {text: "Pergunta inserida com sucesso!"});

                }

            });
        }
        console.log("New Question");
    }

};

exports.removeQuestion = function (req, res) {
    //verifica se a pergunta nao esta a ser utilizado em nenhum teste
    var user = req.params.userID;
    console.log('removeQuestion:  '+ user);
    dbTests.list({
        'include_docs': true, 'attachments': true,
        'limit': undefined, 'descending': false
    }, function (err, tests) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Conta o nr de testes onde a pergunta e usada
        var nTestes = jsonQuery('[doc][questions][*_id=' + req.params.id + ']', {data: tests.rows}).value.length;
        //Se a pergunta estiver a ser usada
        if (nTestes) {
            res.send(401, {result: "Não é possível remover a pergunta porque está a ser utilizada em " + nTestes + " testes."});
        } else {
            //Search question Info
            dbQuest.get(req.params.id, function (err, qustionData) {
                if (err) {
                    //Report Error (Student Doenst Exists)
                    console.log("Error Removing question");
                    console.log(err.statusCode);
                    res.send(401, {result: "Não foi possível remover a pergunta."});
                }
                else {
                    console.log(qustionData);
                    //Se a pergunta é da minha autoria
                    if (qustionData.profID == user) {
                        dbQuest.destroy(qustionData._id, qustionData._rev, function (err) {

                            if (err) {
                                //Report Error (Student Doenst Exists)
                                console.log("Error Removing Student");
                                return res.status(err.statusCode).json({});
                            }
                            else {
                                console.log("question Removed");
                                res.send(200, {result: "Pergunta eliminada com sucesso."});

                            }

                        });
                    } else {
                        res.send(401, {result: "Apenas o autor desta pergunta (" + qustionData.profID + ") a pode eliminar."});

                    }


                }

            })
        }

    });
};

function wordPrefix($col) {
    var $col = ($col)
        .replace(/(\r\n|\n|\r)/gm, " ")  //Replaces all 3 types of line breaks with a space
        .replace(/\s+/g, " ")            //Replace all double white spaces with single spaces
        .split(" ");                   //Split String Into Array

    var $json = [];

    for (var i in $col) {
        $json.push($col[i]);
    }

    return $json;
}
