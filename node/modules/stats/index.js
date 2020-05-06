const request = require('request');

const apiRequest = async (url) => {
  return new Promise( async (resolve, reject) => {
    request.get(url, {
      headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:75.0) Gecko/20100101 Firefox/75.0'}
    },
    (err, response) => {
      try {
        resolve(JSON.parse(response.body));
      } catch(err) {
        resolve(false);
      }
    });
  });
}
module.exports = async (req, res) => {
  const title = 'Haridusportaal';
  const version = process.env.VERSION || '0.0.0';
  const apiUrl = 'https://api.hp.edu.ee/translations?_format=json&lang=etas';
  const releasesUrl = 'https://api.github.com/repos/hariduspilv/haridusportaal/releases';

  const apiData = await apiRequest(apiUrl);
  const releasesData = await apiRequest(releasesUrl);

  res.send({
    title,
    version,
    api_status: apiData ? true : false,
    releases: releasesData,
  });
}