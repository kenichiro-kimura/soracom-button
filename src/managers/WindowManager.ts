import { BrowserWindow, ipcMain, BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { ConfigManager } from './ConfigManager';
import { WireguardConfig } from '../arcConfig';
import { IPC_CHANNELS } from '../constants';

/**
 * ウィンドウ管理クラス
 */
export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  /**
   * メインウィンドウを作成
   */
  createMainWindow(): void {
    const options: BrowserWindowConstructorOptions = {
      width: 1210,
      height: 700,
      title: 'soracom button',
      webPreferences: {
        // セキュリティリスクを下げるためnodeIntegrationをfalseに設定
        nodeIntegration: false,
        // レンダラープロセスに公開するAPIのファイル
        contextIsolation: true,
        // sandboxの設定
        sandbox: true,
        // preloadの設定
        preload: path.resolve(__dirname, '..', 'preload.js')
      }
    };

    // 新しいブラウザーウィンドーを生成
    this.mainWindow = new BrowserWindow(options);

    // 今のディレクトリーで「 index.html」をロード
    this.mainWindow.loadURL('file://' + path.resolve(__dirname, '..', 'index.html')).then(() => {
      const sticker = this.configManager.getSticker();
      this.setSticker(sticker);
    }).catch((error) => {
      console.error('ウィンドーのロード中にエラーが発生しました:', error);
    });

    // ウィンドーが閉じられたら呼び出される (アプリケーション終了)
    this.mainWindow.on('closed', () => {
      // ウィンドーオブジェクトの参照を削除
      this.mainWindow = null;
    });
  }

  /**
   * メインウィンドウの取得
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * ステッカーを設定
   */
  setSticker(label: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.configManager.setSticker(label);
      this.mainWindow.webContents.send(IPC_CHANNELS.SET_STICKER, label);
    }
  }

  /**
   * ウィンドウサイズを変更
   */
  resize(size: 'large' | 'middle' | 'small'): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    switch (size) {
      case 'large':
        this.mainWindow.setBounds({ width: 1210, height: 700 });
        break;
      case 'middle':
        this.mainWindow.setBounds({ width: 705, height: 350 });
        break;
      case 'small':
        this.mainWindow.setBounds({ width: 352, height: 250 });
        break;
      default:
        size = 'large';
    }

    this.mainWindow.webContents.send(IPC_CHANNELS.SET_WINDOW_SIZE, size);
  }

  /**
   * ラベルを更新
   */
  updateLabels(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.SET_LABEL);
    }
  }

  /**
   * WireGuard設定用サブウインドウを開く
   */
  openWireGuardConfigWindow(): void {
    let configWindow: BrowserWindow | null = new BrowserWindow({
      width: 600,
      height: 400,
      title: 'WireGuard Config',
      parent: this.mainWindow || undefined,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, '..', 'preload.js')
      }
    });

    // メニューを非表示にする
    configWindow.setMenu(null);

    configWindow.loadFile(path.resolve(__dirname, '..', 'config.html'));

    // 初期値取得用IPCハンドラを一時登録
    ipcMain.handleOnce('get-wireguard-config-text', () => {
      return this.configManager.wireguardConfig.configText();
    });

    // イベントハンドラ
    const closeHandler = () => {
      if (configWindow) configWindow.close();
      configWindow = null;
    };
    ipcMain.once('close-wireguard-config-window', closeHandler);

    ipcMain.once('save-wireguard-config', (_event, text: string) => {
      try {
        // wireguardConfigとarcConfigを更新
        const newConfig = WireguardConfig.fromConfigText(text);
        this.configManager.updateWireguardConfig(newConfig);
        closeHandler();
      } catch (e) {
        if (configWindow) {
          configWindow.webContents.executeJavaScript(
            `alert('Failed to parse WireGuard config: ' + ${JSON.stringify(String(e))})`
          );
        }
      }
    });

    configWindow.on('closed', () => {
      configWindow = null;
    });
  }
}