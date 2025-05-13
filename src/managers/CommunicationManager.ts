import dgram from 'dgram';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { ipcMain } from 'electron';
import { load, DataType } from 'node-ffi-rs';
import { ConfigManager } from './ConfigManager';
import { LibSoratunLoader } from '../utils/LibSoratunLoader';
import { IPC_CHANNELS, UNI_PORT, UDP_TIMEOUT } from '../constants';
import i18n from '../i18n';

// HTTP通信のレスポンス型を定義
interface HttpResponse {
  [key: string]: unknown;
}

/**
 * 通信管理クラス
 */
export class CommunicationManager {
  private configManager: ConfigManager;
  private libSoratun: LibSoratunLoader;

  constructor(configManager: ConfigManager, libSoratun: LibSoratunLoader) {
    this.configManager = configManager;
    this.libSoratun = libSoratun;
  }

  /**
   * IPC通信ハンドラを設定
   */
  setupIPCHandlers(): void {
    // UDP通信のハンドラー
    ipcMain.handle(IPC_CHANNELS.SEND_UDP, async (_event, arg: { clickType: number | string, batteryLevel: number | string }) => {
      return this.sendUDP(arg);
    });

    // HTTP通信のハンドラー
    ipcMain.handle(IPC_CHANNELS.SEND_HTTP, async (_event, arg: { url: string, method?: string, headers?: Record<string, string>, body?: unknown }) => {
      return this.sendHTTP(arg);
    });

    // 設定取得のハンドラー
    ipcMain.handle(IPC_CHANNELS.GET_ENDPOINT, () => this.configManager.endpoint);
    ipcMain.handle(IPC_CHANNELS.GET_UDP_HOST, () => this.configManager.udphost);
    ipcMain.handle(IPC_CHANNELS.GET_I18N_MESSAGE, (_event, label: string) => {
      return i18n.t(label);
    });
  }

  /**
   * UDP通信を実行
   */
  private sendUDP(arg: { clickType: number | string, batteryLevel: number | string }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        const client = dgram.createSocket('udp4');
        const message = new Uint8Array(4);
        message[0] = 0x4d;
        message[1] = Number(arg.clickType);
        message[2] = Number(arg.batteryLevel);
        message[3] = 0x4d + Number(arg.clickType) + Number(arg.batteryLevel);

        if (this.libSoratun.loaded && this.configManager.arcConfig.hasArcConfig()) {
          // libsoratunが読み込まれていて、arcConfigが設定されている場合
          // タイムアウトはlibsoratun側で設定されているので、setTimeoutは不要
          const uresult = load({
            library: 'libsoratun',
            funcName: 'SendUDP',
            retType: DataType.String,
            paramsType: [DataType.String, DataType.U8Array, DataType.I64, DataType.I64, DataType.I64],
            paramsValue: [JSON.stringify(this.configManager.arcConfig), message, message.length, UNI_PORT, UDP_TIMEOUT]
          });

          /* 戻り値の先頭が数字の2で無い場合はデータエラー */
          if (uresult[0] !== '2') {
            reject(uresult);
          } else {
            resolve(uresult);
          }
          return;
        }

        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('UDP timeout'));
        }, UDP_TIMEOUT);

        client.on('message', (msg) => {
          clearTimeout(timeout);
          client.close();
          /* 戻り値の先頭が50(文字コード。数字の'2')で無い場合はデータエラー */
          if (msg[0] !== 50) {
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

        client.send(message, 0, message.length, UNI_PORT, this.configManager.udphost, (err) => {
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
  }

  /**
   * HTTP通信を実行
   */
  private sendHTTP(arg: { url: string, method?: string, headers?: Record<string, string>, body?: unknown }): Promise<HttpResponse | string> {
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
            if (typeof res.statusCode === 'number' && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const response = data ? JSON.parse(data) : {};
                resolve(response);
              } catch (e) {
                console.error(e);
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
  }
}