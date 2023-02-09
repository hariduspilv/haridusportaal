const path = require('path');
const iconJSON = require('./.webpack/iconJSON');
const IconfontPlugin = require('./.webpack/iconFontGenerator');
const resolve = path.resolve.bind(path, __dirname);

module.exports = {
  plugins: [
    new IconfontPlugin({
      src: resolve('src/icons'),
      family: 'iconfont',
      dest: {
        font: resolve('src/assets/fonts/[family].[type]'),
        css: resolve('src/app/scss/_[family].scss')
      },
      watch: {
        cwd: __dirname,
        pattern: 'src/icons/*.svg'
      }
    }),
    new iconJSON({
      watch: {
        cwd: __dirname,
        pattern: 'src/icons/*.svg'
      }
    }),
  ],
}
