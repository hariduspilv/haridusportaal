const Jimp = require('jimp');
// const fs = require('fs');
const request = require('request');
const sharp = require('sharp');
const path = require('path');
const botCheck = require('../botCheck');
const cheerio = require('cheerio');
const log4js = require("log4js");
log4js.configure({
  appenders: { amp: { type: "file", filename: path.join(__dirname, '../../logs/amp.log') } },
  categories: { default: { appenders: ["amp"], level: "all" } }
});

const imageSize = 756;

// const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// module.exports.getCachedName = (url, req) => {
//   const hash = hashCode(url);
//   const fileTitle = url.split('/')[url.split('/').length - 1].replace('.svg', '');
//   if (botCheck.isBot(req)) {
//     return `${fileTitle}-${hash}-bot.png`;
//   };
//   return `${fileTitle}-${hash}.png`;
// }

// const checkFileExistance = async (url, req) => {
//   return new Promise(async (resolve, reject) => {
//     if (!url) { resolve(false); }
//     const fileName = this.getCachedName(url, req);
//     const exists = await fs.existsSync(path.resolve('./pictos/cache', fileName));
//     resolve(exists);
//   });
// }

module.exports.getSvgFile = async(url) => {
  console.log('in GetSvgFile')
  const logger = log4js.getLogger('amp');
  return new Promise(async (resolve, reject) => {
    if (!url) {
      logger.error(`Picto request failed: url -> ${url}`);
      resolve(false);
    }
    const file = request.get(url, async (err, file) => {
      // console.log(url, err);
      if (err) {
        logger.error(`Picto request failed: ${url} -> ${err}`);
      }
      const body = file.body.replace(/#.+?;/igm, '#2e3374;');
      // console.log(body);
      /**
       * last successful log
       * test without replace on previous line
       * add more logs below...
       */
      const $ = cheerio.load(body);
      $('svg').attr({
        width: imageSize,
        height: imageSize,
      });
      console.log($('body').html());
      console.log(Buffer.from($('body').html()));
      const buffer = Buffer.from($('body').html());
      const svg = await sharp(buffer).toBuffer();
      console.log(svg);
      if (!svg) {
        console.error('SVG MISSING')
        logger.error(`Picto buffer failed: ${url}`);
      }
      const img = await Jimp.read(svg);
      if (!img) {
        console.error('IMG MISSING')
        logger.error(`Picto convert from buffer failed: ${url}`);
      }
      // console.log(img);
      resolve(img);
    });
  });
}

module.exports.compileImage = async (svg, url, req) => {
  console.log('in CompileImage');
  const logger = log4js.getLogger('amp');
  return new Promise(async (resolve, reject) => {
    // const fileName = this.getCachedName(url, req);
    const backgroundCount = 5;
    const imageNumber = rand(1, backgroundCount);
    const backgroundPath = path.resolve('./pictos/backgrounds/', `picto-${imageNumber}.png`);
    let png = await Jimp.read(backgroundPath);
    if (!png) {
      logger.error(`Picto background convert from buffer failed: ${url}`);
    }
    png = await png.composite(svg, 0, 0);
    if (!png) {
      logger.error(`Picto svg compose failed: ${url}`);
    }

    if (botCheck.isBot(req)) {
      const extraHeight = imageSize;
      const artboard = await new Jimp(imageSize + extraHeight, imageSize, 'white');
      png = await artboard.composite(png, extraHeight / 2, 0);
    }

    // (await png).write(path.resolve('./pictos/cache', fileName));
    const buffer = await png.getBufferAsync(Jimp.MIME_PNG);
    resolve(buffer);
  });
}

// module.exports.servePNG = async (req, res) => {
//   let fileName = getCachedName(req.query.url, req);
//   const filePath = path.resolve('./pictos/cache', fileName);
//   const png = await fs.readFileSync(filePath);
//   res.set('Content-Type', 'image/png');
//   res.send(png);
// }

module.exports.generatePNG = async (req, res) => {
  console.log('in GeneratePng')
  const svg = await this.getSvgFile(req.query.url);
  console.log(svg);
  const png = await this.compileImage(svg, req.query.url, req);
  res.set('Content-Type', 'image/png');
  res.send(png);
}

module.exports.serve = async (req, res) => {
  // const exists = await checkFileExistance(req.query.url, req);
  //generatePNG(req,res,);
  console.log('in Serve');
  // exists ? await servePNG(req, res) : await generatePNG(req, res);
  await this.generatePNG(req, res);
}

/*
  const img = await Jimp.read('./pictos/picto-1.png');
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  res.set('Content-Type', 'image/png');
  res.send(buffer);
*/