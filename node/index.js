const express = require('express');
const router = express.Router();
const app = express();
const picto = require(`${__dirname}/modules/picto`);
const amp = require(`${__dirname}/modules/amp`);
const angularImporter = require(`${__dirname}/modules/import`);
const compression = require('compression')
const botCheck = require(`${__dirname}/modules/botCheck`);
const serveStatic = require('serve-static');

const port = 80;

angularImporter();

/* use gZip */
app.use(compression());

console.log(`Starting server at port ${port}`);

const setCustomCacheControl = (res, path) => {
  if (serveStatic.mime.lookup(path) === 'text/html') {
    res.setHeader('Cache-Control', 'public, max-age=0')
  }
};

app.use('/', express.static(`${__dirname}/dist`, {
  maxAge: '1d',
  setHeaders: setCustomCacheControl
}));

app.get('/amp/*', amp.serve);
app.get('/picto', picto.serve);

app.get('*', botCheck.redirect, (req, res, next) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.listen(port);