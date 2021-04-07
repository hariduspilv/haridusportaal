const path = require('path');
const amp = require(path.resolve('./', 'modules/amp'));
const log4js = require("log4js");
log4js.configure({
  appenders: { amp: { type: "file", filename: path.join(__dirname, '../../logs/amp.log') } },
  categories: { default: { appenders: ["amp"], level: "all" } }
});
const logger = log4js.getLogger('amp');

module.exports.isBot = (req) => {
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

  return isBotTest;
}

module.exports.redirect = (req, res, next, ) => {
  if (this.isBot(req)) {
    logger.debug(`Bot detected, serving amp -> ${req}`);
    amp.serve(req,res);
  } else {
    logger.debug(`No bot detected, redirecting -> ${req}`);
    return next();
  }

}