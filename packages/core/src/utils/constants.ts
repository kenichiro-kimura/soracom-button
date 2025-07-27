/**
 * 共通定数
 */

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
] as const;

// バッテリーレベルのラベル
export const BATTERY_LEVEL_LABELS = ['0.25', '0.5', '0.75', '1.0'] as const;

// ロングクリックの閾値（ミリ秒）
export const LONG_CLICK_THRESHOLD = 1000;

// デフォルト設定値
export const DEFAULT_CONFIG = {
  endpoint: 'http://uni.soracom.io',
  udphost: 'button.soracom.io',
  language: 'en-US' as const,
  sticker: 'white'
};