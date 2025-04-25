import i18next from 'i18next';
import i18nBackend from 'i18next-fs-backend';
import path from 'path';

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

i18next.use(i18nBackend);
if (!i18next.isInitialized) i18next.init(options);

export default i18next;
