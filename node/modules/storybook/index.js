const fs = require('fs');
const path = require('path');

module.exports = async (req, res, next) => {
  const storybookExists = await fs.existsSync(path.resolve('./', 'dist/storybook'));
  if (!storybookExists) {
    return next();
  } else {
    res.sendFile(`${__dirname}/dist/storybook/index.html`);
  }
}