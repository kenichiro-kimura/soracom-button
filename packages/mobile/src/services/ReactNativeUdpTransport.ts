/**
 * React Native用のUDPトランスポートアダプター
 */
import dgram from 'react-native-udp';
import { UdpTransport } from '@soracom-button/core';

export class ReactNativeUdpTransport implements UdpTransport {
  async send(message: Uint8Array, host: string, port: number, timeout: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      
      const timeoutHandle = setTimeout(() => {
        client.close();
        reject(new Error('UDP timeout'));
      }, timeout);

      client.on('message', (msg: Buffer) => {
        clearTimeout(timeoutHandle);
        client.close();
        resolve(new Uint8Array(msg));
      });

      client.on('error', (err: Error) => {
        clearTimeout(timeoutHandle);
        client.close();
        reject(err);
      });

      client.send(Buffer.from(message), port, host, (err?: Error) => {
        if (err) {
          clearTimeout(timeoutHandle);
          client.close();
          reject(err);
        }
      });
    });
  }
}