const { contextBridge, ipcRenderer } = require('electron');
const axios = require('axios');
let endpoint;

contextBridge.exposeInMainWorld(
  'api', {
    send: async (arg) => {
      const rt = await axios.post(endpoint, arg);
      return (rt);
    },
    setSticker: (listener) => {
      ipcRenderer.on('ipc-set-sticker', (event, arg) => listener(arg));
    },
    setWindowSize: (listener) => {
      ipcRenderer.on('ipc-set-window-size', (event, arg) => listener(arg));
    },
    getEndpoint: () =>
      ipcRenderer.invoke('ipc-get-endpoint')
        .then((result) => { endpoint = result; })
        .catch(err => console.log(err))
  }
);
