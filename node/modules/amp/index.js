const request = require('request');
const fields = require('./fields');
const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

module.exports.getPrefix = (server) => {
  return new Promise(async (resolve, reject) => {
    const urlTemplates = {
      "edu.twn.ee": "https://htm.wiseman.ee",
      "edu.ee": "https://api.hp.edu.ee",
      "www.edu.ee": "https://api.hp.edu.ee",
      "test.edu.ee": "https://apitest.hp.edu.ee",
      "htm.local": "https://htm.wiseman.ee",
      "haridusportaal.edu.ee": "https://api.hp.edu.ee",
      "fallback": "https://htm.wiseman.ee"
    }
    const prefix = urlTemplates[server] || urlTemplates.fallback;
    resolve(prefix);
  });
}

module.exports.getRequestParams = (articlePath, api) => {
  const map = {
    "uudised": {
      "queryKey": "newsSingel",
      "pageTitle": "Uudised"
    },
    "sündmused": {
      "queryKey": "getEventSingle",
      "pageTitle": "Sündmused"
    },
    "erialad": {
      "queryKey": "studyProgrammeSingle",
      "pageTitle": "Erialad"
    },
    "ametialad": {
      "queryKey": "oskaMainProfessionDetailView",
      "pageTitle": "Ametialad"
    },
    "valdkonnad": {
      "queryKey": "oskaFieldDetailView",
      "pageTitle": "Valdkonnad"
    },
    "tööjõuprognoos": {
      "queryKey": "oskaSurveyPageDetailView",
      "pageTitle": "Tööjõuprognoos"
    },
    "oska-tulemused": {
      "queryKey": "oskaResultPageDetailView",
      "pageTitle": "Tulemused"
    },
    "kool": {
      "queryKey": "getSchoolSingle",
      "pageTitle": "Õppeasutused"
    },
    "artiklid": {
      "queryKey": "getArticle",
      "pageTitle": "Artikkel"
    },
  };

  return new Promise(async (resolve, reject) => {
    request.get(`${api}/variables?_format=json&lang=et`, (err, response) => {
      const splitValues = articlePath.split('/') || [];
      const values = splitValues[0] === '' ? splitValues[1] : splitValues[0];
      const mapValues = map[values] || {};

      let data = {};
      try {
        data = JSON.parse(response.body);
      } catch (err) {}
      if (data.request){
        resolve({
          api,
          ...mapValues,
          queryId: data.request[mapValues.queryKey],
          path: articlePath,
        });
      } else {
        resolve({});
      }
    });
  });
}

module.exports.getData = (opts) => {
  return new Promise(async (resolve, reject) => {
    let url = `${opts.api}/graphql?queryId=${opts.queryId}:1&variables={%22lang%22:%22ET%22,%22path%22:%22${opts.path}%22}`;
    url = decodeURI(url);
    request.get(url, (err, response) => {
      let data = {};
      try {
        data = JSON.parse(response.body).data.route || {};
      } catch (err) {}
      
      resolve(data);
    });
  });
}

module.exports.serve = async (req, res) => {
  const articlePath = req.params[0];
  const apiPrefix = await this.getPrefix(req.get('host'));
  const requestOptions = await this.getRequestParams(articlePath, apiPrefix);

  let rawData = {};

  if (requestOptions.queryId) {
     rawData = await this.getData(requestOptions);
  }
  
  const data = rawData.entity || {};
  const parsedData = fields(data);

  const styles = await fs.readFileSync(path.resolve('./modules/amp/', 'styles.css'), 'utf8');
  const template = await fs.readFileSync(path.resolve('./modules/amp/', 'template.mustache'), 'utf8');

  const picto = parsedData.fieldPictogram && parsedData.fieldPictogram.entity
    ? parsedData.fieldPictogram.entity.url : false;
  const output = Mustache.render(template, {
    ...parsedData,
    styles,
    picto,
    pageTitle: requestOptions.pageTitle,
  });

  if (Object.keys(data).length === 0) {
    if (req.url.match('/amp')) {
      const url = req.url.replace('/amp', '');
      console.log(url);
      res.redirect(url);
    } else {
      res.sendFile(path.resolve('./', 'dist/index.html'));
    }
  } else {
    res.send(output);
  }
}