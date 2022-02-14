const path = require('path');
const IconfontPlugin = require('iconfont-plugin-webpack');
const iconJSON = require('../.webpack/iconJSON');
const resolve = path.resolve.bind(path, __dirname);

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  config.plugins.push(...[
    new IconfontPlugin({
      src: resolve('../src/icons'),
      family: 'iconfont',
      dest: {
        font: resolve('../src/assets/fonts/[family].[type]'),
        css: resolve('../src/app/scss/_[family].scss')
      },
      watch: {
        cwd: __dirname,
        pattern: '../src/icons/*.svg'
      }
    }),
    new iconJSON({
      watch: {
        cwd: __dirname,
        pattern: '../src/icons/*.svg'
      }
    }),
  ]);

  config.module.rules.push({
    test: /\.html$/i,
    include: [
      path.resolve(__dirname, '..', 'stories')
    ],
    loader: "html-loader",
  });
  
  // Return the altered config
  return config;
};
