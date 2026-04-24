/**
 * Electron用のUDPトランスポートアダプター
 */
import dgram from 'dgram';
import { UdpTransport } from '@soracom-button/core';

export class ElectronUdpTransport implements UdpTransport {
  async send(message: Uint8Array, host: string, port: number, timeout: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      
      const timeoutHandle = setTimeout(() => {
        client.close();
        reject(new Error('UDP timeout'));
      }, timeout);

      client.on('message', (msg) => {
        clearTimeout(timeoutHandle);
        client.close();
        resolve(new Uint8Array(msg));
      });

      client.on('error', (err) => {
        clearTimeout(timeoutHandle);
        client.close();
        reject(err);
      });

      client.send(message, 0, message.length, port, host, (err) => {
        if (err) {
          clearTimeout(timeoutHandle);
          client.close();
          reject(err);
        }
      });
    });
  }
}