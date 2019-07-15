class Log {
  constructor() {
    this.reset = "\x1b[0m";
  }
  error(text) {
    const theme = '\x1b[1m\x1b[31m';
    console.log(theme, text, this.reset);
  }
  success(text) {
    const theme = '\x1b[1m\x1b[32m';
    console.log(theme, text, this.reset);
  }
  info(text) {
    const theme = '\x1b[1m';
    console.log(theme, text, this.reset);
  }
}

const log = new Log();
let conf = '';
try{
  conf = require('./conf')[process.env.TASK];
  log.success('/scripts.conf.js present');
}catch(err) {
  log.error('/scripts/conf.js file not found!');
  process.exit();
}

var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
 
ftpDeploy.deploy(conf.ftp, function(err, res) {
  if (err) {
    console.log(err);
  }
  else {
    log.success(`${conf.name} deployment successful! Visit: ${conf.path}`);
  }
});