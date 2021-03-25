const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;
const log4js = require("log4js");
log4js.configure({
  appenders: { amp: { type: "file", filename: path.join(__dirname, '../../logs/amp.log') } },
  categories: { default: { appenders: ["amp"], level: "all" } }
});

module.exports = async () => {
  const logger = log4js.getLogger('amp');
  const angularExists = await fs.existsSync(path.resolve('./', 'dist'));
  if (!angularExists) {
    const source = path.resolve('./', '../angular-fe/dist');
    const destination = path.resolve('./', 'dist');
    const findDist = await fs.existsSync(source);
    if (findDist) {
      ncp.limit = 16;
      ncp(source, destination, (err) => {
        if (err) {
          console.log(err);
          logger.error(`Angular dist copying failed: ${err}`);
        } else {
          logger.debug('Angular dist copied!');
        }
      });
    }
  } else {
    console.log('Angular dist exists!');
  }
}