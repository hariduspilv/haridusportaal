const Jimp = require('jimp');
const fs = require('fs');
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

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const getCachedName = (url, req) => {
  const hash = hashCode(url);
  const fileTitle = url.split('/')[url.split('/').length - 1].replace('.svg', '');
  if (botCheck.isBot(req)) {
    return `${fileTitle}-${hash}-bot.png`;
  };
  return `${fileTitle}-${hash}.png`;
}

const checkFileExistance = async (url, req) => {
  return new Promise(async (resolve, reject) => {
    if (!url) { resolve(false); }
    const fileName = getCachedName(url, req);
    const exists = await fs.existsSync(path.resolve('./pictos/cache', fileName));
    resolve(exists);
  });
}

const getSvgFile = async(url) => {
  const logger = log4js.getLogger('amp');
  return new Promise(async (resolve, reject) => {
    if (!url) {
      logger.error(`Picto request failed: url -> ${url}`);
      resolve(false);
    }
    console.log(url);
    const file = request.get(url, async (err, file) => {
      if (err) {
        logger.error(`Picto request failed: ${url} -> ${err}`);
      }
      const body = file.body.replace(/#.+?;/igm, '#2e3374;');
      const $ = cheerio.load(body);
      $('svg').attr({
        width: imageSize,
        height: imageSize,
      });
      const buffer = Buffer.from($('body').html());
      const svg = await sharp(buffer).toBuffer();
      if (!svg) {
        logger.error(`Picto buffer failed: ${url}`);
      }
      const img = await Jimp.read(svg);
      if (!img) {
        logger.error(`Picto convert from buffer failed: ${url}`);
      }
      resolve(img);
    });
  });
}

const compileImage = async (svg, url, req) => {
  const logger = log4js.getLogger('amp');
  return new Promise(async (resolve, reject) => {
    const fileName = getCachedName(url, req);
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

    (await png).write(path.resolve('./pictos/cache', fileName));
    const buffer = await png.getBufferAsync(Jimp.MIME_PNG);
    resolve(buffer);
  });
}

const servePNG = async (req, res) => {
  let fileName = getCachedName(req.query.url, req);
  const filePath = path.resolve('./pictos/cache', fileName);
  const png = await fs.readFileSync(filePath);
  res.set('Content-Type', 'image/png');
  res.send(png);
}

const generatePNG = async (req, res) => {
  const svg = await getSvgFile(req.query.url);
  const png = await compileImage(svg, req.query.url, req);
  res.set('Content-Type', 'image/png');
  res.send(png);
}

module.exports.serve = async (req, res) => {
  const exists = await checkFileExistance(req.query.url, req);
  //generatePNG(req,res,);
  exists ? servePNG(req, res) : generatePNG(req, res);
}

/*
  const img = await Jimp.read('./pictos/picto-1.png');
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  res.set('Content-Type', 'image/png');
  res.send(buffer);
*/