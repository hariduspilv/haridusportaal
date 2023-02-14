const http = require("http");

const dev = process.env.NODE_ENV === "development";

module.exports.serve = async (req, res) => {
  const [z, x, negy] = req.path.split("/").slice(2);
  const attribution = `ASUTUS=HM&KESKKOND=${dev ? "TEST" : "LIVE"}&IS=HP`;
  const options = {
    host: "tiles.maaamet.ee",
    port: 80,
    path: `/tm/tms/1.0.0/hallkaart@LEST/${z}/${x}/${negy}?${attribution}`,
    method: "GET",
    headers: req.headers,
  };

  const creq = http
    .request(options, (pres) => {
      res.set('Cache-Control', 'public, max-age=36000');
      res.writeHead(pres.statusCode);
      pres.on("data", (chunk) => {
        res.write(chunk);
      });
      pres.on("close", () => {
        res.end();
      });
      pres.on("end", () => {
        res.end();
      });
    })
    .on("error", (e) => {
      console.log(e.message);
      try {
        res.writeHead(500);
        res.write(e.message);
      } catch {}
      res.end();
    });

  creq.end();
};
