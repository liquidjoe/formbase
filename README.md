formbase
========

A service for storing and retrieving forms and mapping data from web crawls and tests.
Formbase is a simple REST service written using Node.js. Currently it runs on port 28001,
it has no access control or anything, yet, so its only suitable for internal use.

Setting up
----------

First of all, you need Node.js. I'd suggest installing via
[a package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

You also want the node package manager npm (need steps for this)

Then you'll want to install the dependencies that formbase has:

Install Mongoose:

`$ npm install -g mongoose`

`$ npm install -g mongoose-types`

Install Restify:

`$ npm install -g restify`

and you need node-unit to run the tests:

`$ npm install -g nodeunit`

Running the Formbase
--------------------

To run it just run using node:

`$ node formbase.js`

`FormBase listening at http://0.0.0.0:28001`

Once it's running then you can run the tests
in another window:

`$ node tests.js`

Formbase Objects
----------------
There are 2 types of objects current defined in the Formbase -- Forms and Mappings.

A Form has the following fields:

 * name -- the name of the form from the form tag
 * formID -- the id of the form from the form tag
 * srcURL -- the document that the form was found in.
 * formHTML -- the full HTML of the form
 * modified -- (auto generated timestamp)
 
Mappings are intended to be the saved results of running
our field recognizer on the form.

A Mappings has the following fields:

 * form -- a reference to the form that was scanned
 * hasEmail -- true if an email field was found
 * hasPassword -- true if a password field was found
 * hasPhone -- true if a phone field was found
 * fields -- an array of the Field objects found by the recognizer

Storing Forms
-------------
You can store new forms via a POST request to
**http://localhost:28001/form**

`$ curl -v -H "Content-Type: application/json" -X POST -d '{"srcURL": "http://www.cnn.com", "formID": "loginForm", "formHTML": "<form></form>"}' localhost:28001/form`

The post request returns the ID of the form that was created or modified.

`{"id":"4fb3fb63866e410938000002"}`

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

This will return an array with every form! So you really want to use limit and skip parameters:

**http://localhost:28001/forms/?limit=100**
…will give you the first 100

**http://localhost:28001/forms/?limit=100&skip=3500**
…will give you 100 starting at number 3500