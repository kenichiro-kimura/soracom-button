import Store from 'electron-store';
import { WireguardConfig, ArcConfig } from '../arcConfig';
import i18n from '../i18n';

/**
 * 設定の型定義
 */
type ConfigStore = {
  endpoint: string;
  udphost: string;
  language: string;
  sticker?: string;
  privateKey?: string;
  logLevel?: number;
  serverPeerPublicKey?: string;
  serverEndpoint?: string;
  allowedIPs?: string[];
  clientPeerIpAddress?: string;
};

/**
 * 設定管理クラス
 */
export class ConfigManager {
  private store: Store<ConfigStore>;
  private _wireguardConfig: WireguardConfig;
  private _arcConfig: ArcConfig;

  constructor() {
    this.store = new Store<ConfigStore>();
    this._wireguardConfig = this.initWireguardConfig();
    this._arcConfig = this.initArcConfig();
  }

  /**
   * WireguardConfigの初期化
   */
  private initWireguardConfig(): WireguardConfig {
    return new WireguardConfig(
      this.store.get('privateKey') ?? "",
      this.store.get('serverPeerPublicKey') ?? "",
      this.store.get('serverEndpoint') ?? "",
      this.store.get('allowedIPs') ?? [],
      this.store.get('clientPeerIpAddress') ?? ""
    );
  }

  /**
   * ArcConfigの初期化
   */
  private initArcConfig(): ArcConfig {
    return ArcConfig.fromWireguardConfig(this._wireguardConfig)
      .setLogLevel(this.store.get('logLevel') ?? 0);
  }

  /**
   * エンドポイント設定の取得
   */
  get endpoint(): string {
    const endpoint = this.store.get('endpoint') ?? 'http://uni.soracom.io';
    this.store.set('endpoint', endpoint);
    return endpoint;
  }

  /**
   * UDPホスト設定の取得
   */
  get udphost(): string {
    const udphost = this.store.get('udphost') ?? 'button.soracom.io';
    this.store.set('udphost', udphost);
    return udphost;
  }

  /**
   * 言語設定の取得
   */
  get language(): string {
    const language = this.store.get('language') ?? 'en-US';
    this.store.set('language', language);
    return language;
  }

  /**
   * WireGuard設定の取得
   */
  get wireguardConfig(): WireguardConfig {
    return this._wireguardConfig;
  }

  /**
   * Arc設定の取得
   */
  get arcConfig(): ArcConfig {
    return this._arcConfig;
  }

  /**
   * 言語設定の保存
   */
  setLanguage(language: string): void {
    this.store.set('language', language);
    i18n.changeLanguage(language);
  }

  /**
   * ステッカー設定の保存
   */
  setSticker(sticker: string): void {
    this.store.set('sticker', sticker);
  }

  /**
   * ステッカー設定の取得
   */
  getSticker(): string {
    return this.store.get('sticker', 'white');
  }

  /**
   * WireGuard設定の更新
   */
  updateWireguardConfig(config: WireguardConfig): void {
    this._wireguardConfig = config;
    this._arcConfig = ArcConfig.fromWireguardConfig(config)
      .setLogLevel(this.store.get('logLevel') ?? 0);

    // 設定を保存
    this.store.set('privateKey', config.privateKey);
    this.store.set('serverPeerPublicKey', config.serverPeerPublicKey);
    this.store.set('serverEndpoint', config.serverEndpoint);
    this.store.set('allowedIPs', config.allowedIPs);
    this.store.set('clientPeerIpAddress', config.clientPeerIpAddress);
  }
}