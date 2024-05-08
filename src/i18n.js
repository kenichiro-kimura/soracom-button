const i18n = require('i18next');
const i18nBackend = require('i18next-fs-backend');
const path = require('path');

const options = {
  lng: 'en-US',
  initImmediate: false,
  backend: {
    loadPath: path.resolve(__dirname, 'languages/{{lng}}.json'),
    addPath: path.resolve(__dirname, 'languages/{{lng}}.missing.json'),
    jsonIndent: 4
  },
  whiteList: [
    'en-US',
    'ja-JP',
    'zh-CN',
    'ko-KR',
    'es-ES',
    'de-DE',
    'fr-FR'
  ]
};

i18n.use(i18nBackend);

if (!i18n.isInitialized) i18n.init(options);
module.exports = i18n;
