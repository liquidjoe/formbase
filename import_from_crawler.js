var _db = require('mysql');
var db = _db.createClient({
    user:'root',
    password:'ab720',
    host: 'localhost'
});

var restify = require('restify');

var formbaseClient = restify.createJsonClient({
    url: 'http://localhost:28001'
});


db.query('use crawler',function(err) {
    if (err) {
        console.log("holy cow, no crawler db: " + err);
        process.exit(1);
    }
    initFormsTransfer();
});

var insertAForm = function(htmlID, rawHTML, siteURL) {
    var formData = {
        "srcURL": siteURL,
        "formHTML": rawHTML,
        "crawlerID": htmlID
    }
    formbaseClient.post('/rawform', formData, function(err, req, res, obj) {
        if (err) {
            console.log("\nerror posting to formbase: " + err + "\n");
        }
    });
}

var getFormsOut = function(start, howmany, total) {
    if(start >= total){
        console.log("\ndone");
        return;
        //process.exit(0);
    }
    process.stdout.write("Importing " + start + " of " + total + "\r");

    db.query("select html.id,site.site,html.html from site,html where site.id=html.site_id LIMIT ?, ?",
             [start, howmany], function(err,forms) {

        if(!err){
            for(var i=0;i<forms.length;i++){
                var htmlID = forms[i].id;
                var rawHTML = forms[i].html;
                var siteURL = forms[i].site;

                insertAForm(htmlID,rawHTML,siteURL);
            }
        } else {

            console.log("uh oh: " + err);
        }
        getFormsOut(start + howmany, howmany, total);
    });
}

var initFormsTransfer = function(){
    db.query("select count(*) as c from html", function(err,results) {
        if (err) {
            console.log("rats an error getting the count: " + err);
            return;
        }
        getFormsOut(0, 250, results[0].c);
    });
}
