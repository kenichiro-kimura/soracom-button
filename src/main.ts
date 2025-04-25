import path from 'path';
import Store from 'electron-store';
import { app, shell, Menu, BrowserWindow, ipcMain, MenuItemConstructorOptions, BrowserWindowConstructorOptions } from 'electron';
import i18n from './i18n';
import dgram from 'dgram';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// IPC通信のチャネル名を定数として定義
const IPC_CHANNELS = {
  // メインプロセスへの呼び出し（handle）
  SEND_HTTP: 'soracom:send-http',
  SEND_UDP: 'soracom:send-udp',
  GET_ENDPOINT: 'soracom:get-endpoint',
  GET_UDP_HOST: 'soracom:get-udphost',
  GET_I18N_MESSAGE: 'soracom:get-i18n-message',

  // メインプロセスからの通知（send）
  SET_STICKER: 'soracom:set-sticker',
  SET_WINDOW_SIZE: 'soracom:set-window-size',
  SET_LABEL: 'soracom:set-label'
} as const;
type IpcChannels = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

// UDPとHTTP通信の設定
const UNI_PORT = 23080;
const UDP_TIMEOUT = 5000;

// ウィンドーオブジェクトを全域に維持
let mainWindow: BrowserWindow | null = null;

// すべてのウィンドーが閉じられたら呼び出される (アプリケーション終了)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 設定を読み込む
type PrefStore = {
  endpoint: string;
  udphost: string;
  language: string;
  sticker?: string;
};
const preference = new Store<PrefStore>();

const endpoint = preference.get('endpoint') ?? 'http://uni.soracom.io';
preference.set('endpoint', endpoint);
const udphost = preference.get('udphost') ?? 'button.soracom.io';
preference.set('udphost', udphost);
const language = preference.get('language') ?? 'en-US';
preference.set('language', language);
i18n.changeLanguage(language);

// メニューを準備する
const setMenu = () => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: i18n.t('file'),
      submenu: [
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
              click: () => { resize('large'); }
            },
            {
              label: i18n.t('middle'),
              click: () => { resize('middle'); }
            },
            {
              label: i18n.t('small'),
              click: () => { resize('small'); }
            }
          ]
        },
        {
          label: i18n.t('sticker'),
          submenu: [
            {
              label: i18n.t('lte-m button for enterprise'),
              click: () => { setSticker('white'); }
            },
            {
              label: i18n.t('soracom ug'),
              click: () => { setSticker('soracomug'); }
            }
          ]
        },
        {
          label: i18n.t('language'),
          submenu: [
            {
              label: i18n.t('en-US'),
              click: () => { changeLanguage('en-US'); }
            },
            {
              label: i18n.t('ja-JP'),
              click: () => { changeLanguage('ja-JP'); }
            },
            {
              label: i18n.t('zh-CN'),
              click: () => { changeLanguage('zh-CN'); }
            },
            {
              label: i18n.t('ko-KR'),
              click: () => { changeLanguage('ko-KR'); }
            },
            {
              label: i18n.t('es-ES'),
              click: () => { changeLanguage('es-ES'); }
            },
            {
              label: i18n.t('de-DE'),
              click: () => { changeLanguage('de-DE'); }
            },
            {
              label: i18n.t('fr-FR'),
              click: () => { changeLanguage('fr-FR'); }
            }
          ]
        }
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
              // エラー時は何もしない
            }
          }
        },
        {
          label: 'open devTools for WebView',
          click () {
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
};

setMenu();

// Electronの初期化が完了し、ブラウザーウィンドーを開く準備ができたら実行
app.on('ready', function () {
  const options: BrowserWindowConstructorOptions = {
    width: 1210,
    height: 700,
    title: 'soracom button',
    webPreferences: {
      // セキュリティリスクを下げるためnodeIntegrationをfalseに設定
      nodeIntegration: false,
      // レンダラープロセスに公開するAPIのファイル
      // （Electron 11 から、デフォルト：falseが非推奨となった）
      contextIsolation: true,
      // sandboxの設定
      sandbox: true,
      // preloadの設定
      preload: path.resolve(__dirname, 'preload.js')
    }
  };
  // 新しいブラウザーウィンドーを生成
  mainWindow = new BrowserWindow(options);

  // 今のディレクトリーで「 index.html」をロード
  mainWindow.loadURL('file://' + __dirname + '/index.html').then(() => {
    const sticker = preference.get('sticker', 'white');
    preference.set('sticker', sticker);
    setSticker(sticker);
  }).catch((error) => {
    console.error('ウィンドーのロード中にエラーが発生しました:', error);
  });

  // ウィンドーが閉じられたら呼び出される  (アプリケーション終了)
  mainWindow.on('closed', function () {
    // ウィンドーオブジェクトの参照を削除
    mainWindow = null;
  });
});

// IPC ハンドラーの登録関数
function setupIPCHandlers () {
  // UDP通信のハンドラー
  ipcMain.handle(IPC_CHANNELS.SEND_UDP, async (_event, arg: { clickType: number|string, batteryLevel: number|string }) => {
    return new Promise((resolve, reject) => {
      try {
        const client = dgram.createSocket('udp4');
        const message = new Uint8Array(4);
        message[0] = 0x4d;
        message[1] = Number(arg.clickType);
        message[2] = Number(arg.batteryLevel);
        message[3] = 0x4d + Number(arg.clickType) + Number(arg.batteryLevel);

        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('UDP timeout'));
        }, UDP_TIMEOUT);

        client.on('message', (msg) => {
          clearTimeout(timeout);
          client.close();
          /* 戻り値の先頭が50(文字コード。数字の'2')で無い場合はデータエラー */
          if (msg[0] !== 50) {
            reject(msg);
          } else {
            resolve(msg);
          }
        });

        client.on('error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.send(message, 0, message.length, UNI_PORT, udphost, (err) => {
          if (err) {
            clearTimeout(timeout);
            client.close();
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });

  // HTTP通信のハンドラー
  ipcMain.handle(IPC_CHANNELS.SEND_HTTP, async (_event, arg: { url: string, method?: string, headers?: Record<string, string>, body?: any }) => {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(arg.url);
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: arg.method || 'POST',
          headers: arg.headers || {
            'Content-Type': 'application/json'
          }
        };

        const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (typeof res.statusCode === 'number' && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const response = data ? JSON.parse(data) : {};
                resolve(response);
              } catch (e) {
                resolve(data);
              }
            } else {
              reject(new Error(`HTTP Error: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        if (arg.body) {
          const postData = typeof arg.body === 'string' ? arg.body : JSON.stringify(arg.body);
          req.write(postData);
        }

        req.end();
      } catch (err) {
        reject(err);
      }
    });
  });

  // 設定取得のハンドラー
  ipcMain.handle(IPC_CHANNELS.GET_ENDPOINT, () => endpoint);
  ipcMain.handle(IPC_CHANNELS.GET_UDP_HOST, () => udphost);
  ipcMain.handle(IPC_CHANNELS.GET_I18N_MESSAGE, (_event, label: string) => i18n.t(label));
}

// IPC ハンドラーの初期化
setupIPCHandlers();

const setSticker = (label: string) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    preference.set('sticker', label);
    mainWindow.webContents.send(IPC_CHANNELS.SET_STICKER, label);
  }
};

const changeLanguage = (newLanguage: string) => {
  preference.set('language', newLanguage);
  i18n.changeLanguage(newLanguage);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SET_LABEL);
  }

  setMenu();
};

const resize = (size: 'large' | 'middle' | 'small') => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  switch (size) {
    case 'large':
      mainWindow.setBounds({ width: 1210, height: 700 });
      break;
    case 'middle':
      mainWindow.setBounds({ width: 705, height: 350 });
      break;
    case 'small':
      mainWindow.setBounds({ width: 352, height: 250 });
      break;
    default:
      size = 'large';
  }

  mainWindow.webContents.send(IPC_CHANNELS.SET_WINDOW_SIZE, size);
};

// MacOSでのアプリケーションライフサイクル対応
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // 新しいウィンドウを作成
    const options: BrowserWindowConstructorOptions = {
      width: 1210,
      height: 700,
      title: 'soracom button',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.resolve(__dirname, 'preload.js')
      }
    };
    mainWindow = new BrowserWindow(options);

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  }
});
