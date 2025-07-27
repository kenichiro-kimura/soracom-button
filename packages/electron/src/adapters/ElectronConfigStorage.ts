/**
 * Electron用のConfigStorageアダプター
 */
import Store from 'electron-store';
import { ConfigStorage } from '@soracom-button/core';

export class ElectronConfigStorage implements ConfigStorage {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  async get<T>(key: string, defaultValue?: T): Promise<T> {
    return this.store.get(key, defaultValue as any) as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}