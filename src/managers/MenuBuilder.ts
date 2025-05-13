import { shell, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { ConfigManager } from './ConfigManager';
import { WindowManager } from './WindowManager';
import { SUPPORTED_LANGUAGES } from '../constants';
import i18n from '../i18n';

/**
 * メニュービルダークラス
 */
export class MenuBuilder {
  private configManager: ConfigManager;
  private windowManager: WindowManager;

  constructor(configManager: ConfigManager, windowManager: WindowManager) {
    this.configManager = configManager;
    this.windowManager = windowManager;
  }

  /**
   * メニューを構築して設定
   */
  buildAndSetMenu(): void {
    const template: MenuItemConstructorOptions[] = [
      {
        label: i18n.t('file'),
        submenu: [
          {
            label: i18n.t('wireGuard config'),
            click: () => { this.windowManager.openWireGuardConfigWindow(); }
          },
          { role: 'close', label: i18n.t('exit') }
        ]
      },
      {
        label: i18n.t('view'),
        submenu: [
          {
            label: i18n.t('size'),
            submenu: [
              {
                label: i18n.t('large'),
                click: () => { this.windowManager.resize('large'); }
              },
              {
                label: i18n.t('middle'),
                click: () => { this.windowManager.resize('middle'); }
              },
              {
                label: i18n.t('small'),
                click: () => { this.windowManager.resize('small'); }
              }
            ]
          },
          {
            label: i18n.t('sticker'),
            submenu: [
              {
                label: i18n.t('lte-m button for enterprise'),
                click: () => { this.windowManager.setSticker('white'); }
              },
              {
                label: i18n.t('soracom ug'),
                click: () => { this.windowManager.setSticker('soracomug'); }
              }
            ]
          },
          {
            label: i18n.t('language'),
            submenu: SUPPORTED_LANGUAGES.map((lang) => ({
              label: i18n.t(lang),
              click: () => { this.changeLanguage(lang); }
            }))
          },
        ]
      },
      {
        label: i18n.t('help'),
        submenu: [
          {
            label: i18n.t('user guide'),
            click: async () => {
              try {
                await shell.openExternal('https://users.soracom.io/ja-jp/guides/iot-devices/lte-m-button-enterprise/');
              } catch (e) {
                console.error('ユーザーガイドのURLを開く際にエラーが発生しました:', e);
              }
            }
          },
          {
            label: 'open devTools for WebView',
            click() {
              const mainWindow = BrowserWindow.getFocusedWindow();
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.openDevTools();
              }
            }
          }
        ]
      }
    ];

    // メニューを適用する
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  /**
   * 言語の変更
   */
  private changeLanguage(newLanguage: string): void {
    this.configManager.setLanguage(newLanguage);
    console.log('Language changed to:', newLanguage);

    this.windowManager.updateLabels();
    this.buildAndSetMenu();
  }
}