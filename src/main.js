const path = require('path');
const { app, shell, Menu, BrowserWindow, ipcMain } = require('electron');

// ウィンドーオブジェクトを全域に維持
let mainWindow = null;

// すべてのウィンドーが閉じられたら呼び出される (アプリケーション終了)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// メニューを準備する
const template = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      { role: 'close', label: '終了' }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'しろボタン',
        click: () => { setSticker('white'); }
      },
      {
        label: 'UGバージョン',
        click: () => { setSticker('soracomug'); }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'SORACOM LTE-M Button for Enterprise ユーザーガイド',
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

// 設定を読み込む
const Preference = require('electron-store');
const preference = new Preference();

const endpoint = preference.get('endpoint', 'http://uni.soracom.io');
preference.set('endpoint', endpoint);

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
      // XSS対策としてnodeモジュールをレンダラープロセスで使えなくする
      nodeIntegration: false,
      // レンダラープロセスに公開するAPIのファイル
      // （Electron 11 から、デフォルト：falseが非推奨となった）
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    }
  });

  // 今のディレクトリーで「 index.html」をロード
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // ウィンドーが閉じられたら呼び出される  (アプリケーション終了)
  mainWindow.on('closed', function () {
    // ウィンドーオブジェクトの参照を削除
    mainWindow = null;
  });
});

const setSticker = (label) => {
  mainWindow.webContents.send('ipc-set-sticker', label);
};

ipcMain.handle('ipc-get-endpoint', () => {
  return endpoint;
});
