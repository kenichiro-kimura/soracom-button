/**
 * React Native用のアプリケーションサービス
 * 共有コアライブラリと React Native の橋渡しを行う
 */
import {
  ConfigManager,
  SoracomApiClient,
  I18nManager,
  ButtonManager,
  ClickType,
  BatteryLevel,
  TransmissionStatus,
  LedStatus,
  ButtonClickEvent,
  UNI_PORT,
  UDP_TIMEOUT
} from '@soracom-button/core';
import { ReactNativeConfigStorage } from './ReactNativeConfigStorage';
import { ReactNativeUdpTransport } from './ReactNativeUdpTransport';
import HapticFeedback from 'react-native-haptic-feedback';

/**
 * React Native アプリケーションのメインサービスクラス
 */
export class SoracomButtonService {
  private configManager: ConfigManager;
  private apiClient: SoracomApiClient;
  private i18nManager: I18nManager;
  private buttonManager: ButtonManager;
  private initialized = false;

  constructor() {
    // 設定管理の初期化
    const configStorage = new ReactNativeConfigStorage();
    this.configManager = new ConfigManager(configStorage);

    // API通信の初期化
    const udpTransport = new ReactNativeUdpTransport();
    this.apiClient = new SoracomApiClient(udpTransport);

    // i18n管理の初期化
    this.i18nManager = I18nManager.getInstance();

    // ボタン管理の初期化
    this.buttonManager = new ButtonManager();

    // ボタンクリックイベントのハンドリング
    this.buttonManager.onButtonClick(this.handleButtonClick.bind(this));
  }

  /**
   * サービスの初期化
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 設定の読み込み
      const language = await this.configManager.getLanguage();
      
      // i18nの初期化
      await this.i18nManager.init(language);

      this.initialized = true;
    } catch (error) {
      console.error('Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * ボタン押下開始
   */
  onPressStart(): void {
    this.buttonManager.onPressStart();
    
    // 触覚フィードバック
    HapticFeedback.trigger('impactLight');
  }

  /**
   * ボタン押下終了
   */
  onPressEnd(batteryLevel: BatteryLevel = BatteryLevel.FULL): void {
    this.buttonManager.onPressEnd(batteryLevel);
  }

  /**
   * ボタンクリックイベントの処理
   */
  private async handleButtonClick(event: ButtonClickEvent): Promise<void> {
    try {
      // 送信状態を設定
      this.buttonManager.setTransmissionStatus(TransmissionStatus.SENDING);

      // 設定を取得
      const [endpoint, udphost] = await Promise.all([
        this.configManager.getEndpoint(),
        this.configManager.getUdpHost()
      ]);

      // データ送信
      const result = await this.apiClient.sendButtonData(
        {
          clickType: event.clickType,
          batteryLevel: event.batteryLevel
        },
        udphost,
        UNI_PORT,
        UDP_TIMEOUT
      );

      // 結果に基づいて状態を更新
      if (result.success) {
        this.buttonManager.setTransmissionStatus(TransmissionStatus.SUCCESS);
        HapticFeedback.trigger('notificationSuccess');
      } else {
        this.buttonManager.setTransmissionStatus(TransmissionStatus.FAILED);
        HapticFeedback.trigger('notificationError');
        console.error('Button click transmission failed:', result.error);
      }

      // 3秒後にアイドル状態に戻す
      setTimeout(() => {
        this.buttonManager.setTransmissionStatus(TransmissionStatus.IDLE);
      }, 3000);

    } catch (error) {
      console.error('Error handling button click:', error);
      this.buttonManager.setTransmissionStatus(TransmissionStatus.FAILED);
      HapticFeedback.trigger('notificationError');
    }
  }

  /**
   * 設定管理インスタンスを取得
   */
  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * i18n管理インスタンスを取得
   */
  getI18nManager(): I18nManager {
    return this.i18nManager;
  }

  /**
   * ボタン管理インスタンスを取得
   */
  getButtonManager(): ButtonManager {
    return this.buttonManager;
  }

  /**
   * 翻訳テキストを取得
   */
  t(key: string): string {
    return this.i18nManager.t(key);
  }

  /**
   * サービスのクリーンアップ
   */
  cleanup(): void {
    this.buttonManager.cleanup();
  }
}