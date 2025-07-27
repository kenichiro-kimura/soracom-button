/**
 * ボタン操作とビジネスロジック
 */
import { ClickType, BatteryLevel, ButtonClickEvent, TransmissionStatus, LedStatus } from '../types';
import { LONG_CLICK_THRESHOLD, BATTERY_LEVEL_LABELS } from '../utils/constants';

/**
 * ボタン状態管理クラス
 */
export class ButtonManager {
  private clickCount = 0;
  private clickTimer?: NodeJS.Timeout;
  private pressStartTime = 0;
  private isPressed = false;
  private currentStatus: TransmissionStatus = TransmissionStatus.IDLE;
  private currentLedStatus: LedStatus = LedStatus.OFF;
  
  // イベントリスナー
  private clickHandlers: Array<(event: ButtonClickEvent) => void> = [];
  private statusChangeHandlers: Array<(status: TransmissionStatus) => void> = [];
  private ledChangeHandlers: Array<(status: LedStatus) => void> = [];

  /**
   * ボタン押下開始
   */
  onPressStart(): void {
    if (this.isPressed) return;
    
    this.isPressed = true;
    this.pressStartTime = Date.now();
  }

  /**
   * ボタン押下終了
   */
  onPressEnd(batteryLevel: BatteryLevel = BatteryLevel.FULL): void {
    if (!this.isPressed) return;
    
    this.isPressed = false;
    const pressDuration = Date.now() - this.pressStartTime;
    
    if (pressDuration >= LONG_CLICK_THRESHOLD) {
      // ロングクリック
      this.handleClick(ClickType.LONG, batteryLevel);
    } else {
      // シングルまたはダブルクリック
      this.clickCount++;
      
      // 既存のタイマーをクリア
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
      }
      
      // ダブルクリック判定のタイマーを設定
      this.clickTimer = setTimeout(() => {
        const clickType = this.clickCount === 1 ? ClickType.SINGLE : ClickType.DOUBLE;
        this.handleClick(clickType, batteryLevel);
        this.clickCount = 0;
      }, 300); // 300ms以内のクリックをダブルクリックとして認識
    }
  }

  /**
   * クリック処理
   */
  private handleClick(clickType: ClickType, batteryLevel: BatteryLevel): void {
    const event: ButtonClickEvent = {
      clickType,
      batteryLevel,
      timestamp: Date.now()
    };

    // クリックイベントを通知
    this.clickHandlers.forEach(handler => handler(event));
  }

  /**
   * 送信状態の設定
   */
  setTransmissionStatus(status: TransmissionStatus): void {
    if (this.currentStatus === status) return;
    
    this.currentStatus = status;
    
    // LED状態も更新
    let ledStatus: LedStatus;
    switch (status) {
      case TransmissionStatus.SENDING:
        ledStatus = LedStatus.SENDING;
        break;
      case TransmissionStatus.SUCCESS:
        ledStatus = LedStatus.SUCCESS;
        break;
      case TransmissionStatus.FAILED:
        ledStatus = LedStatus.FAILED;
        break;
      default:
        ledStatus = LedStatus.OFF;
    }
    
    this.setLedStatus(ledStatus);
    this.statusChangeHandlers.forEach(handler => handler(status));
  }

  /**
   * LED状態の設定
   */
  setLedStatus(status: LedStatus): void {
    if (this.currentLedStatus === status) return;
    
    this.currentLedStatus = status;
    this.ledChangeHandlers.forEach(handler => handler(status));
  }

  /**
   * 現在の送信状態を取得
   */
  getTransmissionStatus(): TransmissionStatus {
    return this.currentStatus;
  }

  /**
   * 現在のLED状態を取得
   */
  getLedStatus(): LedStatus {
    return this.currentLedStatus;
  }

  /**
   * クリックイベントリスナーを追加
   */
  onButtonClick(handler: (event: ButtonClickEvent) => void): () => void {
    this.clickHandlers.push(handler);
    
    // アンサブスクライブ関数を返す
    return () => {
      const index = this.clickHandlers.indexOf(handler);
      if (index > -1) {
        this.clickHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 送信状態変更リスナーを追加
   */
  onStatusChange(handler: (status: TransmissionStatus) => void): () => void {
    this.statusChangeHandlers.push(handler);
    
    return () => {
      const index = this.statusChangeHandlers.indexOf(handler);
      if (index > -1) {
        this.statusChangeHandlers.splice(index, 1);
      }
    };
  }

  /**
   * LED状態変更リスナーを追加
   */
  onLedChange(handler: (status: LedStatus) => void): () => void {
    this.ledChangeHandlers.push(handler);
    
    return () => {
      const index = this.ledChangeHandlers.indexOf(handler);
      if (index > -1) {
        this.ledChangeHandlers.splice(index, 1);
      }
    };
  }

  /**
   * バッテリーレベルのラベルを取得
   */
  getBatteryLevelLabel(level: BatteryLevel): string {
    return BATTERY_LEVEL_LABELS[level];
  }

  /**
   * クリックタイプの名前を取得
   */
  getClickTypeName(clickType: ClickType): string {
    switch (clickType) {
      case ClickType.SINGLE:
        return 'SINGLE';
      case ClickType.DOUBLE:
        return 'DOUBLE';
      case ClickType.LONG:
        return 'LONG';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * すべてのタイマーをクリア
   */
  cleanup(): void {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
    }
    this.clickCount = 0;
    this.isPressed = false;
  }
}