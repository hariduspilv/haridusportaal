const path = require('path');
const IconfontPlugin = require('iconfont-plugin-webpack');
const iconJSON = require('../.webpack/iconJSON');
const resolve = path.resolve.bind(path, __dirname);
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
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
  ],
}

