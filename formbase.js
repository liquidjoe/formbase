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
var RawFormSchema = new Schema({
    name: String,
    formID: String,
    srcURL    : { type: String, index: true },
    formHTML  : String,
    modified: Date
});

RawFormSchema.pre('save', function (next) {
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
var FormSchema = new Schema({
    rawform: ObjectId,
    hasEmail: Boolean,
    hasPassword: Boolean,
    hasPhone: Boolean,
    fields: [FieldSchema]
})

var RawForm = mongoose.model('RawForm', RawFormSchema);
var Form = mongoose.model('Form', FormSchema);

var server = restify.createServer({name: "FormBase"});
server.use(restify.queryParser());      // query params copied into req.params
server.use(restify.bodyParser({ mapParams: false }));

function getRawFormByID(req, res, next) {
    var id = req.params["id"];
    RawForm.findById(id).findOne(function(err, doc) {
        if (err) {
            res.json({});
        } else {
            res.json(doc);
        }
    });
    return next();
}

var saveRawForm = function create(req, res, next) {
    var formModel = new RawForm(req.body);
    formModel.save(function(err){
        res.json({id: formModel.get('_id')});
    });
    return next();
}

server.post('/rawform', saveRawForm);
server.put('/rawform', saveRawForm);

server.get('/rawform/:id', getRawFormByID);
server.head('/rawform/:id', getRawFormByID);

server.del('/rawform/:id', function rm(req, res, next) {
    var id = req.params["id"];
    RawForm.findById(id).findOne(function(err, doc) {
        doc.remove();
        res.send(204);
    });
    return next();
});

var rawFormQuery = function(req, res, next) {
    var query = RawForm.find();
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

server.get('/rawforms/', rawFormQuery);

server.listen(28001, function() {
    console.log('%s listening at %s', server.name, server.url);
});