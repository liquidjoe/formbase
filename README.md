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

Storing Forms
-------------
You can store new forms via a POST request to
http://localhost:28001/form

`$ curl -v -H "Content-Type: application/json" -X POST -d '{"srcURL": "http://www.cnn.com", "formID": "loginForm", "formHTML": "<form></form>"}' localhost:28001/form`