const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;

module.exports = async () => {
  const angularExists = await fs.existsSync(path.resolve('./', 'dist'));
  if (!angularExists) {
    const source = path.resolve('./', '../angular-fe/dist/haridusportaal-fe');
    const destination = path.resolve('./', 'dist');
    const findDist = await fs.existsSync(source);
    if (findDist) {
      ncp.limit = 16;
      ncp(source, destination, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Angular dist copied!');
        }
      });
    }
  } else {
    console.log('Angular dist exists!');
  }
}