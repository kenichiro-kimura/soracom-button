/**
 * Electron用のArcトランスポートアダプター (libsoratun)
 */
import { load, DataType } from 'node-ffi-rs';
import { ArcTransport, WireguardConfig } from '@soracom-button/core';
import { LibSoratunLoader } from '../utils/LibSoratunLoader';
import { ArcConfig } from '../arcConfig';

export class ElectronArcTransport implements ArcTransport {
  private libSoratun: LibSoratunLoader;
  private wireguardConfig?: WireguardConfig;
  private logLevel = 0;

  constructor(libSoratun: LibSoratunLoader) {
    this.libSoratun = libSoratun;
  }

  isAvailable(): boolean {
    return this.libSoratun.loaded && this.hasConfig();
  }

  async sendUdp(message: Uint8Array, host: string, port: number, timeout: number): Promise<string> {
    if (!this.isAvailable() || !this.wireguardConfig) {
      throw new Error('Arc transport not available or not configured');
    }

    const arcConfig = ArcConfig.fromWireguardConfig(this.wireguardConfig)
      .setLogLevel(this.logLevel);

    const result = load({
      library: 'libsoratun',
      funcName: 'SendUDP',
      retType: DataType.String,
      paramsType: [DataType.String, DataType.U8Array, DataType.I64, DataType.I64, DataType.I64],
      paramsValue: [JSON.stringify(arcConfig), message, message.length, port, timeout]
    });

    return result;
  }

  setWireguardConfig(config: WireguardConfig): void {
    this.wireguardConfig = config;
  }

  setLogLevel(level: number): void {
    this.logLevel = level;
  }

  private hasConfig(): boolean {
    return this.wireguardConfig !== undefined &&
           this.wireguardConfig.privateKey !== '' &&
           this.wireguardConfig.serverPeerPublicKey !== '' &&
           this.wireguardConfig.serverEndpoint !== '' &&
           this.wireguardConfig.allowedIPs.length > 0 &&
           this.wireguardConfig.clientPeerIpAddress !== '';
  }
}