/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron';

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
  sendHttp: async function (arg: { url: string; method?: string; headers?: Record<string, string>; body?: any; }) {
    return ipcRenderer.invoke(IPC_CHANNELS.SEND_HTTP, arg);
  },
  sendUdp: async (arg: { clickType: number|string, batteryLevel: number|string }) => ipcRenderer.invoke(IPC_CHANNELS.SEND_UDP, arg),
  getEndpoint: async () => ipcRenderer.invoke(IPC_CHANNELS.GET_ENDPOINT),
  getUdpHost: async () => ipcRenderer.invoke(IPC_CHANNELS.GET_UDP_HOST),
  getI18NMessage: async (label: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_I18N_MESSAGE, label),

  // イベントリスナー（on）メソッド
  setSticker: (callback: (arg: any) => void) => {
    ipcRenderer.on(IPC_CHANNELS.SET_STICKER, (_: Electron.IpcRendererEvent, arg: unknown) => callback(arg));
  },
  setWindowSize: (callback: (arg: any) => void) => {
    ipcRenderer.on(IPC_CHANNELS.SET_WINDOW_SIZE, (_: Electron.IpcRendererEvent, arg: unknown) => callback(arg));
  },
  setLabel: (callback: (arg: any) => void) => {
    ipcRenderer.on(IPC_CHANNELS.SET_LABEL, (_: Electron.IpcRendererEvent, arg: unknown) => callback(arg));
  }
};

// レンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('electronAPI', {
  getWireguardConfigText: () => ipcRenderer.invoke('get-wireguard-config-text'),
  closeWireguardConfigWindow: () => ipcRenderer.send('close-wireguard-config-window'),
  saveWireguardConfig: (text: string) => ipcRenderer.send('save-wireguard-config', text)
});