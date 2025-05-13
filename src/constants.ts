// IPC通信のチャネル名を定数として定義
export const IPC_CHANNELS = {
  // メインプロセスへの呼び出し（handle）
  SEND_HTTP: 'soracom:send-http',
  SEND_UDP: 'soracom:send-udp',
  GET_ENDPOINT: 'soracom:get-endpoint',
  GET_UDP_HOST: 'soracom:get-udphost',
  GET_I18N_MESSAGE: 'soracom:get-i18n-message',

  // メインプロセスからの通知（send）
  SET_STICKER: 'soracom:set-sticker',
  SET_WINDOW_SIZE: 'soracom:set-window-size',
  SET_LABEL: 'soracom:set-label'
} as const;

// UDPとHTTP通信の設定
export const UNI_PORT = 23080;
export const UDP_TIMEOUT = 5000;

// サポートされている言語
export const SUPPORTED_LANGUAGES = [
  'en-US',
  'ja-JP',
  'zh-CN',
  'ko-KR',
  'es-ES',
  'de-DE',
  'fr-FR'
];