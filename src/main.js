const path = require('path');
const { app, shell, Menu, BrowserWindow, ipcMain } = require('electron');
const i18n = require('./i18n');

// ウィンドーオブジェクトを全域に維持
let mainWindow = null;

// すべてのウィンドーが閉じられたら呼び出される (アプリケーション終了)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 設定を読み込む
const Preference = require('electron-store');
const preference = new Preference();

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
      // preload.jsでモジュールを使えるようにする
      nodeIntegration: true,
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

const changeLanguage = (newLanguage) => {
  preference.set('language', newLanguage);
  i18n.changeLanguage(newLanguage);
  mainWindow.webContents.send('ipc-set-label');
  setMenu();
};

ipcMain.handle('ipc-get-endpoint', () => {
  return endpoint;
});

ipcMain.handle('ipc-get-udphost', () => {
  return udphost;
});

const resize = (size) => {
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
  mainWindow.webContents.send('ipc-set-window-size', size);
};

ipcMain.handle('ipc-get-i18n-message', (event, label) => {
  return i18n.t(label);
});
