/**
 * Core library integration test
 */
import {
  ClickType,
  BatteryLevel,
  TransmissionStatus,
  ButtonManager,
  I18nManager
} from '../index';

describe('@soracom-button/core integration', () => {
  test('ButtonManager should handle click events correctly', (done) => {
    const buttonManager = new ButtonManager();
    let lastClickEvent: any = null;

    // クリックイベントリスナーを設定
    buttonManager.onButtonClick((event) => {
      lastClickEvent = event;
      
      expect(lastClickEvent).toBeTruthy();
      expect(lastClickEvent.clickType).toBe(ClickType.SINGLE);
      expect(lastClickEvent.batteryLevel).toBe(BatteryLevel.FULL);
      done();
    });

    // シングルクリックをシミュレート
    buttonManager.onPressStart();
    buttonManager.onPressEnd(BatteryLevel.FULL);
  });

  test('I18nManager should initialize correctly', async () => {
    const i18n = I18nManager.getInstance();
    await i18n.init('en-US');
    
    expect(i18n.getCurrentLanguage()).toBe('en-US');
    expect(i18n.t('sending')).toBe('sending');
  });

  test('Enums should have correct values', () => {
    expect(ClickType.SINGLE).toBe(1);
    expect(ClickType.DOUBLE).toBe(2);
    expect(ClickType.LONG).toBe(3);
    
    expect(BatteryLevel.QUARTER).toBe(0);
    expect(BatteryLevel.FULL).toBe(3);
    
    expect(TransmissionStatus.IDLE).toBe('idle');
    expect(TransmissionStatus.SENDING).toBe('sending');
  });
});