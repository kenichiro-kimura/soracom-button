import { SoracomButtonApp } from '../src/SoracomButtonApp';
import { app, BrowserWindow } from 'electron';
import { MenuBuilder } from '../src/managers/MenuBuilder';
import { CommunicationManager } from '../src/managers/CommunicationManager';
import { WindowManager } from '../src/managers/WindowManager';

// 依存モジュールのモック
jest.mock('../src/managers/WindowManager', () => {
  return {
    WindowManager: jest.fn().mockImplementation(() => ({
      createMainWindow: jest.fn()
    }))
  };
});

jest.mock('../src/managers/MenuBuilder', () => {
  return {
    MenuBuilder: jest.fn().mockImplementation(() => ({
      buildAndSetMenu: jest.fn()
    }))
  };
});

jest.mock('../src/managers/CommunicationManager', () => {
  return {
    CommunicationManager: jest.fn().mockImplementation(() => ({
      setupIPCHandlers: jest.fn()
    }))
  };
});

jest.mock('../src/managers/ConfigManager', () => {
  return {
    ConfigManager: jest.fn().mockImplementation(() => ({
      language: 'en-US',
      endpoint: 'http://uni.soracom.io',
      udphost: 'button.soracom.io'
    }))
  };
});

jest.mock('../src/utils/LibSoratunLoader', () => {
  return {
    LibSoratunLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn()
    }))
  };
});

// i18nのモック
jest.mock('../src/i18n', () => ({
  changeLanguage: jest.fn()
}));

describe('SoracomButtonApp', () => {
  let soracomApp: SoracomButtonApp;
  
  beforeEach(() => {
    jest.clearAllMocks();
    soracomApp = new SoracomButtonApp();
  });
  
  test('アプリケーション起動時にメニューが構築され、IPC通信ハンドラが設定される', () => {
    // startメソッドを実行
    soracomApp.start();
    
    // 依存コンポーネントのメソッドが呼ばれることを確認
    const menuBuilder = (soracomApp as unknown as { menuBuilder: MenuBuilder }).menuBuilder;
    const communicationManager = (soracomApp as unknown as { communicationManager: CommunicationManager }).communicationManager;
    
    expect(menuBuilder.buildAndSetMenu).toHaveBeenCalled();
    expect(communicationManager.setupIPCHandlers).toHaveBeenCalled();
  });
  
  test('コンストラクタでアプリケーションイベントハンドラが正しく設定される', () => {
    // イベントハンドラが正しく設定されたか確認
    expect(app.on).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
    expect(app.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(app.on).toHaveBeenCalledWith('activate', expect.any(Function));
  });
  
  test('window-all-closedイベントハンドラの動作', () => {
    // window-all-closedイベントハンドラを取得
    const windowAllClosedHandler = (app.on as jest.Mock).mock.calls.find(
      call => call[0] === 'window-all-closed'
    )[1];
    
    // macOS以外の場合、app.quitが呼ばれる
    Object.defineProperty(process, 'platform', { value: 'win32' });
    windowAllClosedHandler();
    expect(app.quit).toHaveBeenCalled();
    
    // macOSの場合、app.quitは呼ばれない
    jest.clearAllMocks();
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    windowAllClosedHandler();
    expect(app.quit).not.toHaveBeenCalled();
  });
  
  test('readyイベントハンドラの動作', () => {
    // readyイベントハンドラを取得
    const readyHandler = (app.on as jest.Mock).mock.calls.find(
      call => call[0] === 'ready'
    )[1];
    
    // readyハンドラを実行
    readyHandler();
    
    // WindowManagerのcreateMainWindowが呼ばれる
    const windowManager = (soracomApp as unknown as { windowManager: WindowManager }).windowManager;
    expect(windowManager.createMainWindow).toHaveBeenCalled();
  });
  
  test('activateイベントハンドラの動作', () => {
    const activateHandler = (app.on as jest.Mock).mock.calls.find(
      call => call[0] === 'activate'
    )[1];
    
    // ウィンドウが存在しない場合、createMainWindowが呼ばれる
    (BrowserWindow.getAllWindows as jest.Mock).mockReturnValueOnce([]);
    activateHandler();
    const windowManager = (soracomApp as unknown as { windowManager: WindowManager }).windowManager;
    expect(windowManager.createMainWindow).toHaveBeenCalled();
    
    // ウィンドウが存在する場合、createMainWindowは呼ばれない
    jest.clearAllMocks();
    (BrowserWindow.getAllWindows as jest.Mock).mockReturnValueOnce([{ id: 1 }]);
    activateHandler();
    expect(windowManager.createMainWindow).not.toHaveBeenCalled();
  });
});