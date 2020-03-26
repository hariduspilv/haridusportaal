const postcssCustomProperties = require('postcss-custom-properties');

module.exports = ctx => ({
  map: !ctx.env || ctx.env !== 'production' ? { inline: false } : false,
  plugins: [
    require('postcss-import'),
    require('postcss-custom-properties')({
      preserve: false,
    }),
    require('postcss-calc'),
    require('autoprefixer')({
      cascade: false
    }),
    require('postcss-discard-comments')
  ]
});
