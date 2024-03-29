formbase
========

A service for storing and retrieving forms and mapping data from web crawls and tests.
Formbase is a simple REST service written using Node.js. Currently it runs on port 28001,
it has no access control or anything, yet, so its only suitable for internal use.

Setting up
----------

To run locally, you will need [MongoDB](http://www.mongodb.org/display/DOCS/Quickstart).
Using brew to install is a good way to get going on Mac locally:

`$ brew install mongodb`

First of all, you need Node.js. I'd suggest installing via
[a package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

You also want the node package manager npm (need steps for this)

Then you'll want to install the dependencies that formbase has:

Install Mongoose:

`$ npm install -g mongoose`

`$ npm install -g mongoose-types`

Install Restify:

`$ npm install -g restify`

Install Optimist:

`$ npm install -g optimist`

and you need node-unit to run the tests:

`$ npm install -g nodeunit`

Running the Formbase
--------------------

To run it just run using node:

`$ node formbase.js`

`FormBase listening at http://0.0.0.0:28001`

Once it's running then you can run the tests
in another window:

`$ nodeunit tests.js`

Formbase Objects
----------------
There are 2 types of objects current defined in the Formbase -- RawForms and Forms.

A RawForm has the following fields:

 * name -- the name of the form from the form tag
 * formID -- the id of the form from the form tag
 * srcURL -- the document that the form was found in.
 * formHTML -- the full HTML of the form
 * modified -- (auto generated timestamp)
 
Forms are intended to be the saved results of running
our field recognizer on the form.

A Form has the following fields:

 * rawform -- a reference to the form that was scanned
 * hasEmail -- true if an email field was found
 * hasPassword -- true if a password field was found
 * hasPhone -- true if a phone field was found
 * fields -- an array of the Field objects found by the recognizer
 
 Each field in the fields array is an embedded object of them form:  
 
 * fieldType -- the kind of field that was recognized
 * name -- the name of the field in the form.


Storing RawForms
-------------
You can store new forms via a POST request to
**http://localhost:28001/rawform**

`$ curl -v -H "Content-Type: application/json" -X POST -d '{"srcURL": "http://www.cnn.com", "formID": "loginForm", "formHTML": "<form></form>"}' localhost:28001/rawform`

The post request returns the ID of the raw form that was created or modified.

`{"id":"4fb3fb63866e410938000002"}`

Retrieving RawForms
----------------
Individual raw forms can be accessed by ID:

**http://localhost:28001/rawform/:id**

`$ curl -v -H "Content-Type: application/json" http://localhost:28001/rawform/4fb3fb63866e410938000002`

`{"modified":"2012-05-16T19:09:23.180Z",
"srcURL":"http://www.cnn.com",
"formID":"loginForm",
"formHTML":"<form></form>",
"_id":"4fb3fb63866e410938000002"}`

You can get to the list of forms using a query URL:

**http://localhost:28001/rawforms/**

This will return an array with every raw form! So you really want to use limit and skip parameters:

**http://localhost:28001/rawforms/?limit=100**
…will give you the first 100

**http://localhost:28001/rawforms/?limit=100&skip=3500**
…will give you 100 starting at number 3500

Storing Forms
-------------
You can store new forms via a POST request to
**http://localhost:28001/form**

`$ curl -v -H "Content-Type: application/json" -X POST -d '{"rawform": "4fb3fb63866e410938000002", "hasEmail": true, "hasPhone": false, "hasPassword": false, "fields": [{ "fieldType": "input", "name": "password"]}' localhost:28001/form`

The post request returns the ID of the form that was created or modified.

`{"id":"4fb3fb63866e410938000008"}`

Retrieving Forms
----------------
Individual forms can be accessed by ID:

**http://localhost:28001/form/:id**

`$ curl -v -H "Content-Type: application/json" http://localhost:28001/form/4fb3fb63866e410938000002`

`{"modified":"2012-05-16T19:09:23.180Z",
"srcURL":"http://www.cnn.com",
"formID":"loginForm",
"formHTML":"<form></form>",
"_id":"4fb3fb63866e410938000002"}`

You can get to the list of forms using a query URL:

**http://localhost:28001/forms/**

This will return an array with every raw form! So you really want to use limit and skip parameters:

**http://localhost:28001/forms/?limit=100**
…will give you the first 100

**http://localhost:28001/forms/?limit=100&skip=3500**
…will give you 100 starting at number 3500

Exporting From The Crawler
--------------------------
The crawler is currently located at 50.116.36.86 along with the Formbase. It logs forms it finds to a local MySQL database. You can run a script to export all the crawler data into the Formbase:

`$ node crawler_import.js`

This should take around 10 minutes to run. Currently it just dumps everything in there (TODO -- drop the rawforms table first or replace existing forms)

Importing A Local Copy of the Formbase
--------------------------------------
You can import data from the Formbase into your local server. The local server must be running first, then in another window run the remote_import script:

`$ node remote_import.js`

Use the --max option to specify how many forms you want to copy. Since this import copies the mongo objects directly, running it multiple times will replace but not add forms to your local db, unless you use a larger --max. This is because the RawForm entries will have the same _id and replace the existing ones. 