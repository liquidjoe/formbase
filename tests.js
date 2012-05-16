/**
 * This is really more of an integration test at this point because it requires
 * that formbase be running as it uses the rest client.
 * It would be really cool if we had a test client instead...
 * @type {*}
 */

var restify = require('restify');

var client = restify.createJsonClient({
    url: 'http://localhost:28001'
});

var theFormID = null;

var createTestData = function(i, callback) {
    var formData = {
        "srcURL": "http://www.testsrus.com/" + i,
        "formHTML": '<form id="saveForm"><input type="password" name="pw"><input type="submit"></form>',
        "formID": "saveForm"
    }
    client.post('/form', formData, callback);
}

exports.testCreateABunch = function(test) {
    test.leftToDo = 10;
    for (var i = 0; i < 10; i++) {
        createTestData(i, function(err, req, res, obj) {
            test.leftToDo--;
            if (!test.leftToDo) {
                test.done();
            }
        });
    }
}

exports.testGetForm = function(test){
    test.expect(1);
    client.get('/form/1', function(err, req, res, obj) {
        test.ok(!err, "form get is err: " + err);
        test.done();
    });
};

exports.testPostForm = function(test){
    test.expect(2);
    var formData = {
        "srcURL": "http://www.testsrus.com",
        "formHTML": '<form id="saveForm"><input type="password" name="pw"><input type="submit"></form>',
        "formID": "saveForm"
    }
    client.post('/form', formData, function(err, req, res, obj) {
        test.ok(!err, "form post is err: " + err);
        theFormID = obj.id;
        test.ok(theFormID, "the formID is something");
        test.done();
    });
};

// not sure whether to nest this in the testPostForm test or string it like this
exports.testGetLastForm = function(test){
    test.expect(3);
    client.get('/form/' + theFormID, function(err, req, res, obj) {
        test.ok(!err, "form get is err: " + err);
        test.ok(obj, "got the form we put in");
        test.ok(obj._id == theFormID, "has the right ID");
        test.done();
    });
};

exports.testDeleteLastForm = function(test){
    test.expect(1);
    client.del('/form/' + theFormID, function(err, req, res) {
        test.ok(!err, "form del is err: " + err);
        test.done();
    });
};

// not sure whether to nest this in the testDeleteLastForm test or string it like this
// another alternative would be to test the db directly instead of using the rest api
exports.testGetAfterDeleteForm = function(test){
    test.expect(2);
    client.get('/form/' + theFormID, function(err, req, res, obj) {
        test.ok(!err, "form get is err: " + err);
        test.ok(!(obj._id), "form we put in is gone now");
        theFormID = null;
        test.done();
    });
};

exports.testFindForms = function(test) {
    test.expect(2);
    client.get('/forms/', function(err, req, res, obj) {
        test.ok(!err, "forms query is err: " + err);
        test.ok(obj.length, "got a list of forms");
        test.done();
    });
}

exports.testFindFormsWithLimitAndSkip = function(test) {
    test.expect(5);
    client.get('/forms/?limit=5', function(err, req, res, limitList) {
        test.ok(!err, "forms query is err: " + err);
        test.ok(limitList.length == 5, "got only a limit of forms");

        // nesting call so we can check the results
        client.get('/forms/?limit=5&skip=4', function(err, req, res, skipList) {
            test.ok(!err, "forms query is err: " + err);
            test.ok(skipList.length == 5, "got only a limit of forms");
            test.ok(skipList[0]._id == limitList[4]._id, "first skipped list == last limitList");
            test.done();
        });
    });
}
