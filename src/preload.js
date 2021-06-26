const { contextBridge, ipcRenderer } = require('electron');
const axios = require('axios');
const dgram = require('dgram');
const UNI_PORT = 23080;
const UDP_TIMEOUT = 5000;
let endpoint;
let udpHost;

contextBridge.exposeInMainWorld(
  'api', {
    sendHttp: async (arg) => {
      const rt = await axios.post(endpoint, arg);
      return (rt);
    },
    sendUdp: async (arg) => {
      const rt = await _sendUdp(arg);
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
        .catch(err => console.log(err)),
    getUdpHost: () =>
      ipcRenderer.invoke('ipc-get-udphost')
        .then((result) => { udpHost = result; })
        .catch(err => console.log(err))
  }
);

const _sendUdp = (arg) => new Promise((resolve, reject) => {
  const sendData = new Uint8Array(4);
  sendData[0] = 0x4d;
  sendData[1] = parseInt(arg.clickType);
  sendData[2] = parseInt(arg.batteryLevel);
  sendData[3] = 0x50 + parseInt(arg.clickType);
  const socket = dgram.createSocket('udp4');

  const recvTimer = setTimeout(() => {
    clearInterval(recvTimer);
    socket.close();
    reject(new Error('timeout'));
  }, UDP_TIMEOUT);
  socket.on('error', err => {
    clearInterval(recvTimer);
    socket.close();
    reject(err);
  });
  socket.on('message', (message, remote) => {
    clearInterval(recvTimer);
    socket.close();
    resolve(message);
  });
  socket.send(sendData, 0, sendData.length, UNI_PORT, udpHost, (err, bytes) => {
    if (err) {
      clearInterval(recvTimer);
      socket.close();
      reject(err);
    }
  });
});
