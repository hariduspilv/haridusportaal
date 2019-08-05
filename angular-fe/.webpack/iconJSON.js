const Base = require('run-plugin-webpack');
const folder = `${__dirname}`;
const path = require('path');
const fs = require('fs');
const iconsPath = path.resolve(folder, '../src/icons');
const outputPath = path.resolve(folder, '../stories/typography/icons/icons.ts');

const Plugin = Base.extends(function(options) {
	this.options = this.main(options);
});

Plugin.prototype.main = function(options) {
  return new Promise(function(resolve, reject) {
    try{
      fs.readdir(iconsPath, (err, files) => {
        const output = [];
        files.forEach( file => {
          if( file.charAt(0) !== '.' ){
            const parts = file.split('.');
            output.push({
              _name: parts[0],
              _fileName: file,
            });
          }
        });
      
        let outputString = `/* tslint:disable */\r\n export const icons = ${JSON.stringify(output, null, 2)};`;
        fs.writeFile(outputPath, outputString, function(err) {
          if(err) {
              return console.log(err);
          }
          console.log('\x1b[32m', 'Custom iconfont generated!' ,'\x1b[0m');
          resolve();
        }); 
      });
    }catch(err){
      console.log('\x1b[31m', 'Unable to generate iconfont!!!' ,'\x1b[0m');
      resolve();
    }
    
  });
};

module.exports = Plugin;

