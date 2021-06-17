const { contextBridge, ipcRenderer} = require("electron");
const axios = require('axios');
const url = "https://nywf4yd8ll.execute-api.ap-northeast-1.amazonaws.com/data_dump";
//const url = "http://uni.soracom.io";

contextBridge.exposeInMainWorld(
    "api", {
        send: async(arg) => {
          let rt = await axios.post(url,arg);
          return(rt);
        },
        setSticker: (listener) => {
          ipcRenderer.on("ipc-set-sticker", (event, arg) => listener(arg));
        }
    }
);
