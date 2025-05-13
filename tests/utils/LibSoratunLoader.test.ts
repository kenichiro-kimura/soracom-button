import { LibSoratunLoader } from '../../src/utils/LibSoratunLoader';
import * as nodeFfiRs from 'node-ffi-rs';
import * as fs from 'fs';
import * as os from 'os';

// モックの設定
jest.mock('node-ffi-rs', () => ({
  open: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

jest.mock('os', () => ({
  platform: jest.fn()
}));

// 実際のpath.resolveを使用せず、テスト用のモックを提供
jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args) => {
    return args.join('/');
  })
}));

describe('LibSoratunLoader', () => {
  let loader: LibSoratunLoader;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトでは、ライブラリファイルが見つかるように設定
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // デフォルトでWindows環境と仮定
    (os.platform as jest.Mock).mockReturnValue('win32');

    // プロセスのresourcesPathを設定
    Object.defineProperty(process, 'resourcesPath', {
      value: '/app/resources'
    });

    loader = new LibSoratunLoader();
  });

  test('Windows環境では.dllファイルを読み込む', () => {
    // Windows環境の設定
    (os.platform as jest.Mock).mockReturnValue('win32');
    
    loader.load();
    
    // 期待する動作の確認
    expect(fs.existsSync).toHaveBeenCalledWith('/app/resources/app.asar.unpacked/dist/libsoratun.dll');
    expect(nodeFfiRs.open).toHaveBeenCalledWith({
      library: 'libsoratun',
      path: '/app/resources/app.asar.unpacked/dist/libsoratun.dll'
    });
    expect(loader.loaded).toBe(true);
  });

  test('Linux/Mac環境では.soファイルを読み込む', () => {
    // Linux環境の設定
    (os.platform as jest.Mock).mockReturnValue('linux');
    
    loader.load();
    
    // 期待する動作の確認
    expect(fs.existsSync).toHaveBeenCalledWith('/app/resources/app.asar.unpacked/dist/libsoratun.so');
    expect(nodeFfiRs.open).toHaveBeenCalledWith({
      library: 'libsoratun',
      path: '/app/resources/app.asar.unpacked/dist/libsoratun.so'
    });
    expect(loader.loaded).toBe(true);
  });

  test('リソースパスにライブラリが存在しない場合は別のパスを試みる', () => {
    // リソースパスにファイルがない設定
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // __dirnameを設定
    Object.defineProperty(global, '__dirname', {
      value: '/app/current/dir'
    });
    
    loader.load();
    
    // 最初に標準パスを確認
    expect(fs.existsSync).toHaveBeenCalledWith('/app/resources/app.asar.unpacked/dist/libsoratun.dll');
    
    // 代替パスでライブラリを開く - 実際の呼び出しから取得した値をチェック
    expect(nodeFfiRs.open).toHaveBeenCalled();
    const callArgs = (nodeFfiRs.open as jest.Mock).mock.calls[0][0];
    expect(callArgs.library).toBe('libsoratun');
    // パス形式の検証には完全一致ではなく、含まれているかどうかをチェック
    expect(callArgs.path).toContain('../libsoratun.dll');
    
    expect(loader.loaded).toBe(true);
  });
  
  test('ライブラリの読み込みに失敗した場合はloadedがfalseになる', () => {
    // 例外を投げるようにモック
    (nodeFfiRs.open as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to open library');
    });
    
    // コンソールエラーをモック
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
    
    loader.load();
    
    expect(loader.loaded).toBe(false);
    expect(consoleErrorMock).toHaveBeenCalledWith('libsoratunの読み込みに失敗しました:', expect.any(Error));
    
    // モックを復元
    consoleErrorMock.mockRestore();
  });
});