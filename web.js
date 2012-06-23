var express = require('express');
var oauth = require('oauth');
var sys = require('util');

var _twitterConsumerKey = "CnBeavwDfHUzYeOIPkvA";
var _twitterConsumerSecret = "PVdLn1eilJwnriAWI5euVIRfnqipZzfTtfAZs4TmY";

var app = express.createServer(express.logger());
app.register('.haml', require('hamljs'));

function consumer() {
  console.log("Listen herezzzz" )
  console.log("Listen herezzzz" + oauth.OAuth)
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
    _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "http://localhost:5000/sessions/callback", "HMAC-SHA1");
}

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.cookieParser());
  app.use(express.session({secret:"DSADSADSADSADSA"}));
  app.use(express.static(__dirname + '/public'));
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

app.get('/', function(request, response) {
  response.render('index.haml');
});

app.get('/vote', function(request, response) {
  response.send('Hello World!');
});

app.get('/sessions/connect', function(req, res){
  console.log("Listen listen here");
  console.log("Listen listen here");
  console.log("Listen listen here");
  console.log("Listen listen here");
  console.log("Listen listen here");
  console.log("Listen listen here");
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
    }
  });
});

app.get('/sessions/callback', function(req, res){
  consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      // Right here is where we would write out some nice user stuff
      consumer().get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
        } else {
          console.log("data is %j", data);
          data = JSON.parse(data);
          req.session.twitterScreenName = data["screen_name"];    
          res.send('You are signed in: ' + req.session.twitterScreenName)
        }  
      });  
    }
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

