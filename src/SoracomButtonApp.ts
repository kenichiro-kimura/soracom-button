import { app, BrowserWindow } from 'electron';
import { ConfigManager } from './managers/ConfigManager';
import { WindowManager } from './managers/WindowManager';
import { MenuBuilder } from './managers/MenuBuilder';
import { CommunicationManager } from './managers/CommunicationManager';
import { LibSoratunLoader } from './utils/LibSoratunLoader';
import i18n from './i18n';

/**
 * メインアプリケーションクラス
 */
export class SoracomButtonApp {
  private libSoratun: LibSoratunLoader;
  private configManager: ConfigManager;
  private windowManager: WindowManager;
  private menuBuilder: MenuBuilder;
  private communicationManager: CommunicationManager;

  constructor() {
    // 各コンポーネントの初期化
    this.libSoratun = new LibSoratunLoader();
    this.libSoratun.load();

    this.configManager = new ConfigManager();
    
    // i18n初期化
    i18n.changeLanguage(this.configManager.language);

    this.windowManager = new WindowManager(this.configManager);
    this.menuBuilder = new MenuBuilder(this.configManager, this.windowManager);
    this.communicationManager = new CommunicationManager(this.configManager, this.libSoratun);
    
    // アプリケーションイベントハンドラ設定
    this.setupAppEventHandlers();
  }

  /**
   * アプリケーションの起動
   */
  start(): void {
    // メニューの初期化
    this.menuBuilder.buildAndSetMenu();
    
    // IPC通信ハンドラの設定
    this.communicationManager.setupIPCHandlers();
  }

  /**
   * アプリケーションイベントハンドラの設定
   */
  private setupAppEventHandlers(): void {
    // すべてのウィンドーが閉じられたら呼び出される (アプリケーション終了)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Electronの初期化が完了し、ブラウザーウィンドーを開く準備ができたら実行
    app.on('ready', () => {
      this.windowManager.createMainWindow();
    });

    // MacOSでのアプリケーションライフサイクル対応
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow();
      }
    });
  }
}