const { contextBridge, ipcRenderer } = require('electron');
// Node.jsモジュールをメインプロセス側で処理するように変更
const UNI_PORT = 23080;
const UDP_TIMEOUT = 5000;
let endpoint;
let udpHost;

contextBridge.exposeInMainWorld(
  'api', {
    sendHttp: async (arg) => {
      return ipcRenderer.invoke('ipc-send-http', arg);
    },
    sendUdp: async (arg) => {
      return ipcRenderer.invoke('ipc-send-udp', arg);
    },
    setSticker: (listener) => {
      ipcRenderer.on('ipc-set-sticker', (event, arg) => listener(arg));
    },
    setWindowSize: (listener) => {
      ipcRenderer.on('ipc-set-window-size', (event, arg) => listener(arg));
    },
    setLabel: (listener) => {
      ipcRenderer.on('ipc-set-label', (event, arg) => listener(arg));
    },
    getEndpoint: async () => {
      endpoint = await ipcRenderer.invoke('ipc-get-endpoint');
      return endpoint;
    },
    getUdpHost: async () => {
      udpHost = await ipcRenderer.invoke('ipc-get-udphost');
      return udpHost;
    },
    getI18NMessage: async (label) => {
      return await ipcRenderer.invoke('ipc-get-i18n-message', label);
    }
  }
);
