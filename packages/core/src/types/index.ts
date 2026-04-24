/**
 * 共通の型定義
 */

/**
 * ボタンクリックの種類
 */
export enum ClickType {
  SINGLE = 1,
  DOUBLE = 2,
  LONG = 3
}

/**
 * バッテリーレベル
 */
export enum BatteryLevel {
  QUARTER = 0,    // 0.25
  HALF = 1,       // 0.5
  THREE_QUARTER = 2, // 0.75
  FULL = 3        // 1.0
}

/**
 * 送信状態
 */
export enum TransmissionStatus {
  IDLE = 'idle',
  SENDING = 'sending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/**
 * LEDの状態
 */
export enum LedStatus {
  OFF = 'off',
  SENDING = 'sending',  // オレンジで点滅
  SUCCESS = 'success',  // 赤で点灯
  FAILED = 'failed'     // 緑で点灯
}

/**
 * サポート言語
 */
export type SupportedLanguage = 'en-US' | 'ja-JP' | 'zh-CN' | 'ko-KR' | 'es-ES' | 'de-DE' | 'fr-FR';

/**
 * WireGuard設定
 */
export interface WireguardConfig {
  privateKey: string;
  serverPeerPublicKey: string;
  serverEndpoint: string;
  allowedIPs: string[];
  clientPeerIpAddress: string;
}

/**
 * アプリケーション設定
 */
export interface AppConfig {
  endpoint: string;
  udphost: string;
  language: SupportedLanguage;
  sticker?: string;
  wireguard?: WireguardConfig;
}

/**
 * ボタンクリックイベント
 */
export interface ButtonClickEvent {
  clickType: ClickType;
  batteryLevel: BatteryLevel;
  timestamp: number;
}

/**
 * 送信結果
 */
export interface TransmissionResult {
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * HTTP通信オプション
 */
export interface HttpOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * UDP通信オプション
 */
export interface UdpOptions {
  clickType: ClickType;
  batteryLevel: BatteryLevel;
}