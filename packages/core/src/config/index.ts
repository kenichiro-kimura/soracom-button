/**
 * プラットフォーム非依存の設定管理インターフェース
 */
import { AppConfig, SupportedLanguage, WireguardConfig } from '../types';
import { DEFAULT_CONFIG } from '../utils/constants';

/**
 * 設定ストレージの抽象インターフェース
 * プラットフォーム固有の実装（electron-store, AsyncStorage等）はこれを実装する
 */
export interface ConfigStorage {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * プラットフォーム非依存の設定管理クラス
 */
export class ConfigManager {
  private storage: ConfigStorage;

  constructor(storage: ConfigStorage) {
    this.storage = storage;
  }

  /**
   * エンドポイント設定の取得
   */
  async getEndpoint(): Promise<string> {
    return this.storage.get('endpoint', DEFAULT_CONFIG.endpoint);
  }

  /**
   * エンドポイント設定の保存
   */
  async setEndpoint(endpoint: string): Promise<void> {
    await this.storage.set('endpoint', endpoint);
  }

  /**
   * UDPホスト設定の取得
   */
  async getUdpHost(): Promise<string> {
    return this.storage.get('udphost', DEFAULT_CONFIG.udphost);
  }

  /**
   * UDPホスト設定の保存
   */
  async setUdpHost(udphost: string): Promise<void> {
    await this.storage.set('udphost', udphost);
  }

  /**
   * 言語設定の取得
   */
  async getLanguage(): Promise<SupportedLanguage> {
    return this.storage.get('language', DEFAULT_CONFIG.language);
  }

  /**
   * 言語設定の保存
   */
  async setLanguage(language: SupportedLanguage): Promise<void> {
    await this.storage.set('language', language);
  }

  /**
   * ステッカー設定の取得
   */
  async getSticker(): Promise<string> {
    return this.storage.get('sticker', DEFAULT_CONFIG.sticker);
  }

  /**
   * ステッカー設定の保存
   */
  async setSticker(sticker: string): Promise<void> {
    await this.storage.set('sticker', sticker);
  }

  /**
   * WireGuard設定の取得
   */
  async getWireguardConfig(): Promise<WireguardConfig | null> {
    const [privateKey, serverPeerPublicKey, serverEndpoint, allowedIPs, clientPeerIpAddress] = await Promise.all([
      this.storage.get<string>('privateKey'),
      this.storage.get<string>('serverPeerPublicKey'),
      this.storage.get<string>('serverEndpoint'),
      this.storage.get<string[]>('allowedIPs'),
      this.storage.get<string>('clientPeerIpAddress')
    ]);

    if (!privateKey || !serverPeerPublicKey || !serverEndpoint || !allowedIPs || !clientPeerIpAddress) {
      return null;
    }

    return {
      privateKey,
      serverPeerPublicKey,
      serverEndpoint,
      allowedIPs,
      clientPeerIpAddress
    };
  }

  /**
   * WireGuard設定の保存
   */
  async setWireguardConfig(config: WireguardConfig): Promise<void> {
    await Promise.all([
      this.storage.set('privateKey', config.privateKey),
      this.storage.set('serverPeerPublicKey', config.serverPeerPublicKey),
      this.storage.set('serverEndpoint', config.serverEndpoint),
      this.storage.set('allowedIPs', config.allowedIPs),
      this.storage.set('clientPeerIpAddress', config.clientPeerIpAddress)
    ]);
  }

  /**
   * ログレベルの取得
   */
  async getLogLevel(): Promise<number> {
    return this.storage.get('logLevel', 0);
  }

  /**
   * ログレベルの保存
   */
  async setLogLevel(logLevel: number): Promise<void> {
    await this.storage.set('logLevel', logLevel);
  }

  /**
   * 完全な設定の取得
   */
  async getAllConfig(): Promise<AppConfig> {
    const [endpoint, udphost, language, sticker, wireguard] = await Promise.all([
      this.getEndpoint(),
      this.getUdpHost(),
      this.getLanguage(),
      this.getSticker(),
      this.getWireguardConfig()
    ]);

    return {
      endpoint,
      udphost,
      language,
      sticker,
      ...(wireguard && { wireguard })
    };
  }

  /**
   * WireGuard設定が存在するかチェック
   */
  async hasWireguardConfig(): Promise<boolean> {
    const config = await this.getWireguardConfig();
    return config !== null;
  }
}