/**
 * React Native用のConfigStorageアダプター
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigStorage } from '@soracom-button/core';

export class ReactNativeConfigStorage implements ConfigStorage {
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return defaultValue as T;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting config key ${key}:`, error);
      return defaultValue as T;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting config key ${key}:`, error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking config key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting config key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing config storage:', error);
      throw error;
    }
  }
}