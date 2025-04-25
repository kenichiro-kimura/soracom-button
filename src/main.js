const path = require('path');
const Store = require('electron-store');
const { app, shell, Menu, BrowserWindow, ipcMain } = require('electron');
const i18n = require('./i18n');
// 通信処理に必要なモジュール
const dgram = require('dgram');
const https = require('https');
const http = require('http');
const URL = require('url').URL;

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
};

// UDPとHTTP通信の設定
const UNI_PORT = 23080;
const UDP_TIMEOUT = 5000;

// ウィンドーオブジェクトを全域に維持
let mainWindow = null;

// すべてのウィンドーが閉じられたら呼び出される (アプリケーション終了)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 設定を読み込む
const preference = new Store();

const endpoint = preference.get('endpoint', 'http://uni.soracom.io');
preference.set('endpoint', endpoint);
const udphost = preference.get('udphost', 'button.soracom.io');
preference.set('udphost', udphost);
const language = preference.get('language', 'en-US');
preference.set('language', language);
i18n.changeLanguage(language);

// メニューを準備する
const setMenu = () => {
  const template = Menu.buildFromTemplate([
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
            await shell.openExternal('https://users.soracom.io/ja-jp/guides/iot-devices/lte-m-button-enterprise/').catch();
          }
        },
        {
          label: 'open devTools for WebView',
          click () {
            mainWindow.openDevTools();
          }
        }
      ]
    }
  ]);

  // メニューを適用する
  Menu.setApplicationMenu(template);
};

setMenu();

// Electronの初期化が完了し、ブラウザーウィンドーを開く準備ができたら実行
app.on('ready', function () {
  // 新しいブラウザーウィンドーを生成
  mainWindow = new BrowserWindow({
    width: 1210,
    height: 700,
    title: 'soracom button',
    webPreferences: {
      // In Electron 12, the default will be changed to true.
      worldSafeExecuteJavaScript: true,
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
  });

  // 今のディレクトリーで「 index.html」をロード
  mainWindow.loadURL('file://' + __dirname + '/index.html').then(() => {
    const sticker = preference.get('sticker', 'white');
    preference.set('sticker', sticker);
    setSticker(sticker);
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
  ipcMain.handle(IPC_CHANNELS.SEND_UDP, async (event, arg) => {
    return new Promise((resolve, reject) => {
      try {
        const client = dgram.createSocket('udp4');
        const message = new Uint8Array(4);
        message[0] = 0x4d;
        message[1] = parseInt(arg.clickType);
        message[2] = parseInt(arg.batteryLevel);
        message[3] = 0x4d + parseInt(arg.clickType) + parseInt(arg.batteryLevel);

        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('UDP timeout'));
        }, UDP_TIMEOUT);

        client.on('message', (msg) => {
          clearTimeout(timeout);
          client.close();
          /* 戻り値の先頭が50(文字コード。数字の'2')で無い場合はデータエラー */
          if (parseInt(msg[0]) !== 50) {
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
  ipcMain.handle(IPC_CHANNELS.SEND_HTTP, async (event, arg) => {
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
            if (res.statusCode >= 200 && res.statusCode < 300) {
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
  ipcMain.handle(IPC_CHANNELS.GET_I18N_MESSAGE, (event, label) => i18n.t(label));
}

// IPC ハンドラーの初期化
setupIPCHandlers();

const setSticker = (label) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    preference.set('sticker', label);
    mainWindow.webContents.send(IPC_CHANNELS.SET_STICKER, label);
  }
};

const changeLanguage = (newLanguage) => {
  preference.set('language', newLanguage);
  i18n.changeLanguage(newLanguage);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SET_LABEL);
  }

  setMenu();
};

const resize = (size) => {
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
    mainWindow = new BrowserWindow({
      width: 1210,
      height: 700,
      title: 'soracom button',
      webPreferences: {
        worldSafeExecuteJavaScript: true,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.resolve(__dirname, 'preload.js')
      }
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  }
});
