var restify = require('restify');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/formbase');
var mongooseTypes = require("mongoose-types");
mongooseTypes.loadTypes(mongoose);

var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

/**
 * A Form saved from a <form> we found on the web somewhere.
 * We also store the name of the form and its id (values from the DOM)
 *
 * name -- the name of the form from the form tag
 * formID -- the id of the form from the form tag
 * srcURL -- the document that the form was found in.
 * formHTML -- the full HTML of the form
 * modified -- (auto generated timestamp)
 */
var FormSchema = new Schema({
    name: String,
    formID: String,
    srcURL    : { type: String, index: true },
    formHTML  : String,
    modified: Date
});

FormSchema.pre('save', function (next) {
    this.modified = new Date();
    next();
});

/**
 * An embedded type in the Mappings object.
 *
 * fieldType -- the kind of field that was recognized
 * name -- the name of the field in the form.
 */
var FieldSchema = new Schema({
    fieldType: String,
    name: String
})

/**
 * A set of Fields and other data that our field recognizer found.
 *
 * form -- a reference to the form that was scanned
 * hasEmail -- true if an email field was found
 * hasPassword -- true if a password field was found
 * hasPhone -- true if a phone field was found
 * fields -- an array of the Field objects found by the recognizer
 */
var MappingSchema = new Schema({
    form: ObjectId,
    hasEmail: Boolean,
    hasPassword: Boolean,
    hasPhone: Boolean,
    fields: [FieldSchema]
})

var Form = mongoose.model('Form', FormSchema);
var Mappings = mongoose.model('Mapping', MappingSchema);

var createTestForm = function() {
    console.log("creating test form");
    var formModel = new Form();
    formModel.srcURL = 'http://www.hello.com/hello';
    formModel.formHTML = '<form><input type="password"></form>';

    formModel.save(function (err) {
        if (err) return;
        console.log("Saved Form!");
        var mappings = new Mappings();
        mappings.form = formModel._id;
        mappings.fields.push({fieldType: "password", name: "pw"});
        mappings.save(function(err){
            if (err) return;

            console.log("Saved Mappings!");
        });
    });
}

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
}

var server = restify.createServer({name: "FormBase"});
server.use(restify.queryParser());      // query params copied into req.params
server.use(restify.bodyParser({ mapParams: false }));

function getFormByID(req, res, next) {
    var id = req.params["id"];
    Form.findById(id).findOne(function(err, doc) {
        if (err) {
            res.json({});
        } else {
            res.json(doc);
        }
    });
    return next();
}

var saveForm = function create(req, res, next) {
    var formModel = new Form(req.body);
    formModel.save(function(err){
        res.json({id: formModel.get('_id')});
    });
    return next();
}

server.post('/form', saveForm);
server.put('/form', saveForm);

server.get('/form/:id', getFormByID);
server.head('/form/:id', getFormByID);

server.del('/form/:id', function rm(req, res, next) {
    var id = req.params["id"];
    Form.findById(id).findOne(function(err, doc) {
        doc.remove();
        res.send(204);
    });
    return next();
});

var formQuery = function(req, res, next) {
    var query = Form.find();
    if (req.params["limit"]) {
        var limit = parseInt(req.params["limit"]);
        query.limit(limit);
    }
    if (req.params["skip"]) {
        var skip = parseInt(req.params["skip"]);
        query.skip(skip);
    }
    query.exec(function (err, docs) {
        // docs is an array
        res.json(docs);
    });
    return next();
}

server.get('/forms/', formQuery);

server.listen(28001, function() {
    console.log('%s listening at %s', server.name, server.url);
});