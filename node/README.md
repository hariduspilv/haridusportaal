# Node application for serving angular / amp / storybook / stats page

## Testing locally
  1. Make sure angular app is built in /angular-fe/dist
  2. npm i
  3. PORT=4790 AMP_API=https://htm.wiseman.ee nodemon --max-http-header-size 80000 index.js