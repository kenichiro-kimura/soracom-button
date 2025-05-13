import path from 'path';
import { open } from 'node-ffi-rs';
import { platform } from 'os';
import { existsSync } from 'fs';

/**
 * libsoratunライブラリのロードを担当するクラス
 */
export class LibSoratunLoader {
  private _loaded = false;

  /**
   * ライブラリがロードされているかどうか
   */
  get loaded(): boolean {
    return this._loaded;
  }

  /**
   * ライブラリをロード
   */
  load(): void {
    try {
      const dllName = "libsoratun" + (platform() === 'win32' ? ".dll" : ".so");
      let dllPath = path.resolve(process.resourcesPath, "app.asar.unpacked", "dist", dllName);

      if (!existsSync(dllPath)) {
        dllPath = path.resolve(__dirname, "..", dllName);
      }

      open({
        library: 'libsoratun',
        path: dllPath
      });
      this._loaded = true;
    } catch (e) {
      console.error('libsoratunの読み込みに失敗しました:', e);
      this._loaded = false;
    }
  }
}