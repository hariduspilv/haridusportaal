const path = require('path');
const amp = require(path.resolve('./', 'modules/amp'));

module.exports = (req, res, next) => {
  var isBotTest = false;
  var botReq = "";
  var botID= ""; //Just so we know why we think it is a bot
  var knownBots = ["baiduspider", "facebookexternalhit", "twitterbot", "rogerbot", "linkedinbot","embedly|quora\ link\ preview","howyoubot","outbrain","pinterest","slackbot","vkShare"];
  var urlRequest=req.url
  var pos= urlRequest.search("\\?_escaped_fragment_=")

  if (pos != -1) {
    botID="ESCAPED_FRAGMENT_REQ";
    isBotTest = true;
    var reqBits = urlRequest.split("?_escaped_fragment_=")
    if(reqBits[1].length == 0){
      botReq = reqBits[0];
    } else {
      botReq = reqBits[1];
    }

  } else {
      var userAgent = req.get('User-Agent');
      for (var i in knownBots){
        if (userAgent.search(knownBots[i]) != -1){
          isBotTest = true;
          botReq=urlRequest;
          botID=knownBots[i];
        }
      }
  }


  if (isBotTest == true) {
    // bot
    amp.serve(req,res);
  } else {
    // no bot
    return next();
  }

}