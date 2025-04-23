const { contextBridge, ipcRenderer } = require('electron');

// IPC通信のチャネル名を定数として定義
const IPC_CHANNELS = {
  // メインプロセスへの呼び出し（invoke）
  SEND_HTTP: 'soracom:send-http',
  SEND_UDP: 'soracom:send-udp',
  GET_ENDPOINT: 'soracom:get-endpoint',
  GET_UDP_HOST: 'soracom:get-udphost',
  GET_I18N_MESSAGE: 'soracom:get-i18n-message',
  
  // メインプロセスからの通知（on）
  SET_STICKER: 'soracom:set-sticker',
  SET_WINDOW_SIZE: 'soracom:set-window-size',
  SET_LABEL: 'soracom:set-label'
};

// レンダラープロセスへ公開するAPI
const api = {
  // 双方向通信（invoke）メソッド
  sendHttp: async (arg) => ipcRenderer.invoke(IPC_CHANNELS.SEND_HTTP, arg),
  sendUdp: async (arg) => ipcRenderer.invoke(IPC_CHANNELS.SEND_UDP, arg),
  getEndpoint: async () => ipcRenderer.invoke(IPC_CHANNELS.GET_ENDPOINT),
  getUdpHost: async () => ipcRenderer.invoke(IPC_CHANNELS.GET_UDP_HOST),
  getI18NMessage: async (label) => ipcRenderer.invoke(IPC_CHANNELS.GET_I18N_MESSAGE, label),
  
  // イベントリスナー（on）メソッド
  setSticker: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SET_STICKER, (_, arg) => callback(arg));
  },
  setWindowSize: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SET_WINDOW_SIZE, (_, arg) => callback(arg));
  },
  setLabel: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SET_LABEL, (_, arg) => callback(arg));
  },

  // IPC通信のチャネル名（テスト/デバッグ用）
  channels: IPC_CHANNELS
};

// レンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld('api', api);
