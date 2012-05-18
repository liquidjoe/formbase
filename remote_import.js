var restify = require('restify');
var argv = require('optimist')
    .default('max', 4000)
    .default('batchSize', 250)
    .default('remoteHost', 'http://50.116.36.86:28001')
    .default('localHost', 'http://localhost:28001').argv;

var remoteClient = restify.createJsonClient({
    url: argv.remoteHost
});

var localClient = restify.createJsonClient({
    url: argv.localHost
});


var totalDone = 0;
var max = argv.max;
var batchSize = argv.batchSize;

var processBatch = function(formList, hasMore, offset) {
    // post these to the local formbase
    var formData = formList.pop();
    localClient.post('/rawform', formData, function(err, req, res, obj) {
        totalDone++;
        if (err) {
            console.log("\nposting error: " + err);
        }
        if (totalDone >= max) {
            console.log("\nmax (" + max + ") done.");
            process.exit(0);
        }
        if (formList.length) {
            processBatch(formList, hasMore, offset);
        } else if (hasMore) {
            getRemoteForms(offset + batchSize);
        } else {
            console.log("\njobs done -- " + totalDone + " records");
            process.exit(0);
        }
    });
}

var getRemoteForms = function(offset) {
    process.stdout.write("fetching more forms with offset: " + offset + "\r");
    remoteClient.get('/rawforms/?limit=' + batchSize + "&skip=" + offset, function(err, req, res, theList) {
        if (err) {
            console.log("\ngetting error: " + err);
        }
        processBatch(theList, theList.length == batchSize, offset);
    });
}

getRemoteForms(0);

