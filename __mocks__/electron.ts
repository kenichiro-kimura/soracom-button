// Electronのモック
export const app = {
  on: jest.fn(),
  quit: jest.fn(),
  getPath: jest.fn().mockReturnValue('/mock/path')
};

export const BrowserWindow = {
  getAllWindows: jest.fn().mockReturnValue([]),
  fromWebContents: jest.fn()
};

// IPC関連のモック
export const ipcMain = {
  on: jest.fn(),
  handle: jest.fn()
};

export const ipcRenderer = {
  on: jest.fn(),
  invoke: jest.fn()
};

export const Menu = {
  buildFromTemplate: jest.fn().mockReturnValue({
    popup: jest.fn(),
    append: jest.fn(),
    insert: jest.fn()
  }),
  setApplicationMenu: jest.fn()
};

export const MenuItem = jest.fn();

export const dialog = {
  showOpenDialog: jest.fn().mockResolvedValue({ filePaths: [] }),
  showMessageBox: jest.fn().mockResolvedValue({ response: 0 })
};

export const shell = {
  openExternal: jest.fn()
};

export const nativeImage = {
  createFromPath: jest.fn()
};

export const webContents = {
  getFocusedWebContents: jest.fn()
};

// 他のElectron APIが必要な場合はここに追加