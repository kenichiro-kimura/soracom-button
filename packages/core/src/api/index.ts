/**
 * SORACOM API通信管理
 */
import axios, { AxiosRequestConfig } from 'axios';
import { HttpOptions, TransmissionResult, UdpOptions } from '../types';

/**
 * UDP通信の抽象インターフェース
 * プラットフォーム固有の実装（dgram, React Native UDP等）はこれを実装する
 */
export interface UdpTransport {
  send(message: Uint8Array, host: string, port: number, timeout: number): Promise<Uint8Array>;
}

/**
 * SORACOM Arc Integrationの抽象インターフェース
 * プラットフォーム固有の実装（libsoratun等）はこれを実装する
 */
export interface ArcTransport {
  isAvailable(): boolean;
  sendUdp(message: Uint8Array, host: string, port: number, timeout: number): Promise<string>;
}

/**
 * プラットフォーム非依存のSOCACOM API通信クラス
 */
export class SoracomApiClient {
  private udpTransport?: UdpTransport;
  private arcTransport?: ArcTransport;

  constructor(udpTransport?: UdpTransport, arcTransport?: ArcTransport) {
    this.udpTransport = udpTransport;
    this.arcTransport = arcTransport;
  }

  /**
   * UDP通信でボタンデータを送信
   */
  async sendButtonData(options: UdpOptions, host: string, port: number, timeout: number): Promise<TransmissionResult> {
    try {
      // UDPメッセージの構築
      const message = this.buildUdpMessage(options.clickType, options.batteryLevel);

      // SORACOM Arc Integrationが利用可能な場合はそれを使用
      if (this.arcTransport?.isAvailable()) {
        const result = await this.arcTransport.sendUdp(message, host, port, timeout);
        
        // 戻り値の先頭が数字の2でない場合はデータエラー
        if (result[0] !== '2') {
          return {
            success: false,
            error: new Error(`Arc UDP transmission failed: ${result}`)
          };
        }
        
        return {
          success: true,
          message: result
        };
      }

      // 通常のUDP通信
      if (!this.udpTransport) {
        throw new Error('UDP transport not available');
      }

      const response = await this.udpTransport.send(message, host, port, timeout);
      
      // 戻り値の先頭が50(文字コード。数字の'2')でない場合はデータエラー
      if (response[0] !== 50) {
        return {
          success: false,
          error: new Error(`UDP transmission failed: ${response}`)
        };
      }

      return {
        success: true,
        message: new TextDecoder().decode(response)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * HTTP通信を実行
   */
  async sendHttp(options: HttpOptions): Promise<TransmissionResult> {
    try {
      const config: AxiosRequestConfig = {
        url: options.url,
        method: (options.method || 'POST') as any,
        headers: options.headers || {
          'Content-Type': 'application/json'
        },
        data: options.body,
        timeout: 10000 // 10秒タイムアウト
      };

      const response = await axios(config);
      
      return {
        success: true,
        message: JSON.stringify(response.data)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * UDPメッセージを構築
   */
  private buildUdpMessage(clickType: number, batteryLevel: number): Uint8Array {
    const message = new Uint8Array(4);
    message[0] = 0x4d;
    message[1] = Number(clickType);
    message[2] = Number(batteryLevel);
    message[3] = 0x4d + Number(clickType) + Number(batteryLevel);
    return message;
  }

  /**
   * UDP transportを設定
   */
  setUdpTransport(transport: UdpTransport): void {
    this.udpTransport = transport;
  }

  /**
   * Arc transportを設定
   */
  setArcTransport(transport: ArcTransport): void {
    this.arcTransport = transport;
  }
}