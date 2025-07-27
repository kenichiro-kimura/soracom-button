/**
 * 国際化 (i18n) 管理クラス
 */
import i18next from 'i18next';
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

// 言語リソースをインポート
import enUS from './languages/en-US.json';
import jaJP from './languages/ja-JP.json';
import zhCN from './languages/zh-CN.json';
import koKR from './languages/ko-KR.json';
import esES from './languages/es-ES.json';
import deDE from './languages/de-DE.json';
import frFR from './languages/fr-FR.json';

const resources = {
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP },
  'zh-CN': { translation: zhCN },
  'ko-KR': { translation: koKR },
  'es-ES': { translation: esES },
  'de-DE': { translation: deDE },
  'fr-FR': { translation: frFR }
};

/**
 * プラットフォーム非依存のi18n管理クラス
 */
export class I18nManager {
  private static instance: I18nManager;
  private initialized = false;

  private constructor() {}

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * i18nの初期化
   */
  async init(language: SupportedLanguage = 'en-US'): Promise<void> {
    if (this.initialized) {
      return;
    }

    await i18next.init({
      lng: language,
      fallbackLng: 'en-US',
      resources,
      interpolation: {
        escapeValue: false
      }
    });

    this.initialized = true;
  }

  /**
   * 言語の変更
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.initialized) {
      await this.init(language);
      return;
    }
    
    await i18next.changeLanguage(language);
  }

  /**
   * 翻訳テキストの取得
   */
  t(key: string, options?: Record<string, unknown>): string {
    if (!this.initialized) {
      console.warn('I18nManager not initialized. Returning key as fallback.');
      return key;
    }
    
    return i18next.t(key, options);
  }

  /**
   * 現在の言語を取得
   */
  getCurrentLanguage(): SupportedLanguage {
    if (!this.initialized) {
      return 'en-US';
    }
    
    return i18next.language as SupportedLanguage;
  }

  /**
   * サポートされている言語の一覧を取得
   */
  getSupportedLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * 指定された言語がサポートされているかチェック
   */
  isLanguageSupported(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
  }
}