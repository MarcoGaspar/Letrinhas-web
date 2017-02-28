require('colors');

//Database
var config = require('./config.js');
//var nano = require('nano')(config.dbserver);
var nano = require('nano')(config.dbserver);
var db = nano.use(config.db_teachers);

//Requirements
var express = require('express'),
    bodyParser = require('body-parser'),
    basicAuth = require('basic-auth'),
    http = require('http'),
    busboy = require('connect-busboy'); //middleware for form/file upload

//Path Variable
var path = require('path'),
    fs = require('fs-extra'), //File System - for file manipulation
    mime = require('mime');

//Route Controllers
var category = require('./routes/category'),
    fileHandler = require('./routes/fileHandler'),
    questions = require('./routes/questions'),
    resolutions = require('./routes/resolutions'),
    schools = require('./routes/schools'),
    students = require('./routes/students'),
    statistics = require('./routes/statistics'),
    teachers = require('./routes/teachers'),
    tests = require('./routes/tests'),
    testTypes = require('./routes/testTypes');

//Express Variable
var app = express();

//Set BusBoy to Parse Form Immediately
app.use(busboy({
    immediate: true
}));

/**
 * Body Parser Config
 */
app.use(bodyParser({
    limit: '50mb'
})); //Data Transfer Max Size
app.use(bodyParser.urlencoded({
    extended: true
})); //Set URL Enconde
app.use(bodyParser.json()); //Parse Body Data To JSON
app.use(express.static(path.join(__dirname, '/public'))); //Public Folder Path


//Set our server port
app.set('port', config.httpPort);


// get an instance of router
var router = express.Router();

// Route middleware that will happen on every request
router.use(function(req, res, next) {
    // log each request to the console
    switch (req.method) {
        case "GET":
            console.log("Route Request: " + req.method.green, req.url);
            break;
        case "PUT":
            console.log("Route Request: " + req.method.yellow, req.url);
            break;
        case "DELETE":
            console.log("Route Request: " + req.method.red, req.url);
            break;
        case "POST":
            console.log("Route Request: " + req.method.blue, req.url);
            break;
    }

    next();
});

//Build Body and Parse Files When FormData is Uploaded insted of JSON
router.use(function(req, res, next) {
    if (req.busboy != null) {

        req.busboy.on('file', function(fieldname, file, filename) {
            if (filename) {

                req.body['filePath'] = __dirname + "\\tmp\\" + filename;
                console.log("Uploading: " + filename);
                //Path where image will be uploaded
                fstream = fs.createWriteStream(__dirname + '\\tmp\\' + filename);
                file.pipe(fstream);
                fstream.on('close', function() {
                    console.log("Upload Finished of " + filename);
                });
            } else {
                file.resume();
            }
        });


        req.busboy.on('field', function(key, value) {
            req.body[key] = value;
        });

        req.busboy.on('finish', function() {
            next();
        });

    } else {
        next();
    }

});

// Validating Login Credentials
var auth = function(req, res, next) {
    //Check For Login User
    console.log(req.query);
    var login = basicAuth(req);
    console.log(login);
    if (login) {
        db.get(login.name, {
            revs_info: true
        }, function(err, body) {
            if (!err) {
                //console.log(body.password)
                // console.log(login.pass)
                if (body.password == login.pass) {
                    //Login Successfully
                    console.log("Login Successfully");
                    req.user = {
                        name: login.name,
                        perm: body.permissionLevel
                    };
                    next();
                } else {
                    //Report Error (Rong Password)
                    console.log("Login Attempt Failed - Wrong info");
                    return res.status(401).json({
                        result: 'wrongpassword'
                    });
                }
            } else {
                //Report Error (Rong Username)
                console.log("Login Attempt Failed" + err);
                return res.status(401).json({
                    result: 'usernotregisted'
                });
            }

        });
    } else {
        //Report Error (No Auth Credentials)
        console.log("Login Attempt Failed - Missing user");
        return res.status(401).json({
            result: 'notlogged'
        });
    }

};

/**
 * PERMISSIONS:
 * 1 -> Auxiliar
 * 2 -> Professor
 * 3 -> Administrador de Sistema
 *
 * @param level
 * @returns {Function}
 */
// Validating Permissions
var perms = function(level) {
    return function(req, res, next) {
        if (req.user.perm >= level) {
            next();
        } else {
            console.log("Permission Error");
            res.status(401).json({
                text: "Não possui permissões para executar esta tarefa."
            });
        }
    }
};

// Make Teacher Query Be On Logged User
var tself = function(req, res, next) {
    req.params.userID = req.user.name;
    next();
};

// Make App use router
app.use('/', router);


//-----------------------------------------------------CATEGORIES
app.route('/categories')
    .get(auth, perms(2), category.getAll); //

app.route('/categories/:id')
    .get(auth, perms(2), category.getAll)
    .post(auth, perms(2), category.new); //


app.route('/categories/:subject/addContent')
    .put(auth, perms(2), category.addContent);

app.route('/categories/:subject/content/:content/addSpecification')
    .put(auth, perms(2), category.addSpecif);

app.route('/categories/:subject/content/:content/specification/:id')
    .delete(auth, perms(3), category.removeSpecif);

//-----------------------------------------------------QUESTIONS

app.route('/questions')
    .post(auth, tself, perms(2), questions.test)
    .get(auth, tself, perms(2), questions.getAll);

app.route('/questions/:id')
    .post(auth, tself, questions.test)
    .put(auth, tself, questions.upDate)
    .delete(auth, tself, perms(3), questions.removeQuestion)
    .get(auth, perms(2), questions.get);

//-----------------------------------------------------RESOLUTIONS

app.route('/resolutions')
    .get(auth, tself, perms(2), resolutions.getAll)
    .post(auth, tself, perms(2), resolutions.new);

app.route('/resolutions/:id')
    .get(auth, tself, perms(2), resolutions.get);

//-----------------------------------------------------SCHOOLS

app.route('/schools')
    .post(auth, perms(3), schools.new)
    .get(auth, perms(3), schools.getAll);

app.route('/schools/:school')
    .put(auth, perms(3), schools.editSchool)
    .get(auth, perms(3), schools.get)
    .delete(auth, perms(3), schools.removeSchool);

app.route('/schools/:school/newclass')
    .post(auth, perms(3), schools.addClass);

app.route('/schools/:school/removeclass/:class')
    .post(auth, perms(3), schools.removeClass);

app.route('/schools/:school/classes/:class')
    .get(auth, perms(3), schools.getClassInfo);


//-----------------------------------------------------STUDENTS

//Only Return Teacher Related Students
app.route('/students')
    .post(auth, perms(2), students.new)
    .get(auth, perms(2), students.getAll);


app.route('/students/:student')
    .put(auth, perms(2), students.editStudent)
    .get(auth, perms(2), students.get)
    .delete(auth, perms(3), students.removeStudent);

app.route('/students/:id/info')
    .get(auth, perms(2), students.getDetails)


app.route('/students/exist')
    .post(auth, tself, perms(2), students.exist);

//-----------------------------------------------------STATISTICS

//Only Return Teacher Related Students
app.route('/statistics')
    .get(auth, tself, perms(2), statistics.getAll);
//-----------------------------------------------------TEACHERS

app.route('/me') //GETS ACTUAL USER DATA
    .get(auth, tself, teachers.getMyData);

app.route('/login') //GETS ACTUAL USER DATA
    .get(auth, tself, teachers.get);

app.route('/teachers')
    .post(auth, perms(3), teachers.new)
    .get(auth, perms(3), teachers.getAll);

app.route('/teachers/:teacher') //GETS SPECIFIC USER
    .get(auth, perms(3), teachers.get)
    .delete(auth, perms(3), teachers.delete)
    .put(auth, perms(3), teachers.editDetails);


app.route('/teachers/editPasswd')
    .post(auth, perms(3), teachers.editPasswd);

app.route('/teachers/:teacher/editClasses')
    .post(auth, perms(3), teachers.addToClass);

app.route('/teachers/:teacher/removeFromClass')
    .post(auth, perms(3), teachers.removeFromClass);


//-----------------------------------------------------TESTS

app.route('/tests')
    .post(auth, tself, perms(2), tests.newGeneric)
    .get(auth, tself, perms(2), tests.getAll);

app.route('/tests/:id')
    .get(auth, tself, perms(2), tests.get)
    .delete(auth, perms(2), tests.delete);

app.route('/testTypes')
    .get(auth, tself, perms(2), testTypes.getAll);

app.route('/assocTest')
    .post(auth, tself, perms(2), tests.new)
//-----------------------------------------------------file handler
app.route("/file/:db/:id/:filename")
    .get(fileHandler.fileDownload)

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Listening on %d'.green, app.get('port'));
});
