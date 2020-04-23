const Jimp = require('jimp');
const fs = require('fs');
const request = require('request');
const { convert } = require('convert-svg-to-png');
const path = require('path');

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const getCachedName = (url) => {
  const hash = hashCode(url);
  const fileTitle = url.split('/')[url.split('/').length - 1].replace('.svg', '');
  return `${fileTitle}-${hash}.png`;
}

const checkFileExistance = async (url) => {
  return new Promise(async (resolve, reject) => {
    if (!url) { resolve(false); }
    const fileName = getCachedName(url);
    const exists = await fs.existsSync(path.resolve('./pictos/cache', fileName));
    resolve(exists);
  });
}

const getSvgFile = async(url) => {
  return new Promise(async (resolve, reject) => {
    if (!url){resolve(false);}
    const file = request.get(url, async (err, file) => {
      const body = file.body.replace(/#.+?;/igm, '#2e3374');
      const svg = await convert(body, {
        height: 756,
        width: 756,
      });
      const img = Jimp.read(svg);
      resolve(img);
    });
  });
}

const compileImage = async (svg, url) => {
  return new Promise(async (resolve, reject) => {
    const fileName = getCachedName(url);
    const backgroundCount = 5;
    const imageNumber = rand(1, backgroundCount);
    const backgroundPath = path.resolve('./pictos/backgrounds/', `picto-${imageNumber}.png`);
    let png = await Jimp.read(backgroundPath);
    png = await png.composite(svg, 0, 0);

    (await png).write(path.resolve('./pictos/cache', fileName));
    const buffer = await png.getBufferAsync(Jimp.MIME_PNG);
    resolve(buffer);
  });
}

const servePNG = async (req, res) => {
  const fileName = getCachedName(req.query.url);
  const filePath = path.resolve('./pictos/cache', fileName);
  const png = await fs.readFileSync(filePath);
  res.set('Content-Type', 'image/png');
  res.send(png);
}

const generatePNG = async (req, res) => {
  const svg = await getSvgFile(req.query.url);
  const png = await compileImage(svg, req.query.url);
  res.set('Content-Type', 'image/png');
  res.send(png);
}

module.exports.serve = async (req, res) => {
  const exists = await checkFileExistance(req.query.url);
  exists ? servePNG(req, res) : generatePNG(req, res);
}

/*
  const img = await Jimp.read('./pictos/picto-1.png');
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  res.set('Content-Type', 'image/png');
  res.send(buffer);
*/