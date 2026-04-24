module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  // Electronモジュールをモック化
  moduleNameMapper: {
    '^electron$': '<rootDir>/__mocks__/electron.ts'
  }
};