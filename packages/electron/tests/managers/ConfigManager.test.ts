import { ConfigManager } from '../../src/managers/ConfigManager';
import { WireguardConfig } from '../../src/arcConfig';
import i18n from '../../src/i18n';

// electron-storeのモック
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => {
    const store: Record<string, unknown> = {};
    return {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        return store[key] !== undefined ? store[key] : defaultValue;
      }),
      set: jest.fn((key: string, value: unknown) => {
        store[key] = value;
        return store[key];
      })
    };
  });
});

// i18nのモック
jest.mock('../../src/i18n', () => ({
  changeLanguage: jest.fn()
}));

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  
  beforeEach(() => {
    jest.clearAllMocks();
    configManager = new ConfigManager();
  });
  
  test('デフォルト設定が正しく取得できる', () => {
    // デフォルト値の確認
    expect(configManager.endpoint).toBe('http://uni.soracom.io');
    expect(configManager.udphost).toBe('button.soracom.io');
    expect(configManager.language).toBe('en-US');
    expect(configManager.getSticker()).toBe('white');
  });
  
  test('言語設定が正しく保存される', () => {
    configManager.setLanguage('ja-JP');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ja-JP');
  });
  
  test('ステッカー設定が正しく保存・取得できる', () => {
    configManager.setSticker('blue');
    expect(configManager.getSticker()).toBe('blue');
  });
  
  test('WireGuard設定が正しく更新される', () => {
    const testConfig = new WireguardConfig(
      'test-private-key',
      'test-server-public-key',
      'test-server-endpoint',
      ['test-allowed-ip'],
      'test-client-ip'
    );
    
    configManager.updateWireguardConfig(testConfig);
    
    const updatedConfig = configManager.wireguardConfig;
    expect(updatedConfig.privateKey).toBe('test-private-key');
    expect(updatedConfig.serverPeerPublicKey).toBe('test-server-public-key');
    expect(updatedConfig.serverEndpoint).toBe('test-server-endpoint');
    expect(updatedConfig.allowedIPs).toEqual(['test-allowed-ip']);
    expect(updatedConfig.clientPeerIpAddress).toBe('test-client-ip');
  });
});