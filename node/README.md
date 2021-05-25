# Node application for serving angular / amp / storybook / stats page

## Testing locally
  1. Make sure angular app is built in /angular-fe/dist
  2. remove /node/dist folder
  3. npm i
  4. PORT=4790 AMP_API=https://api.haridusportaal.twn.zone nodemon --max-http-header-size 80000 index.js