const { contextBridge, ipcRenderer} = require("electron");
const axios = require('axios');
let url;

contextBridge.exposeInMainWorld(
    "api", {
        send: async(arg) => {
          let rt = await axios.post(url,arg);
          return(rt);
        },
        setSticker: (listener) => {
          ipcRenderer.on("ipc-set-sticker", (event, arg) => listener(arg));
        },
        getEndpoint: () =>
          ipcRenderer.invoke("ipc-get-endpoint")
            .then((result) => {url = result})
            .catch(err => console.log(err))
    }
);
