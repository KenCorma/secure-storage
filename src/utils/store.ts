import { decrypt, encrypt } from './crypt';
import { mainConfig } from './config';

var window: Window & typeof globalThis;
/**
 * @description ⚠️`Experimental`⚠️
 * @description Use this to change the global `window` object
 */
export const changeWindow = (newWindow: any) => {
  window = newWindow;
};

export type SupportedTypes = boolean | object | null | undefined | string | number | bigint;
export type SupportedTypesString = 'boolean' | 'number' | 'bigint' | 'string' | 'object' | 'undefined';

type TemplateData = {
  data: SupportedTypes;
  type: SupportedTypesString;
};

const storeTypes = ['local', 'session'] as const;
export type StoreType = (typeof storeTypes)[number];

export class Store<S extends StoreType> {
  private store: StoreType = 'local' as S;
  private storage: Storage = window.localStorage;

  constructor(store?: S) {
    try {
      this.validateStore(store as StoreType);
      this.store = store as StoreType;
      if (store === 'local') {
        this.storage = window.localStorage;
      }
      if (store === 'session') {
        this.storage = window.sessionStorage;
      }
      this.prefix = this.getPrefix()
    } catch (err) {}
  }

  /**
   * @description Returns string format of data passed or `null`
   * @description Modifies in the format of `{data, type}`
   */
  modifyDataToString = (data: any) => {
    try {
      if (typeof data === 'function' || typeof data === 'symbol') {
        throw new Error('Data must not be a function or symbol');
      }
      const template: TemplateData = {
        data: data,
        // @ts-ignore
        type: typeof data,
      };
      const str = JSON.stringify(template);
      return str;
    } catch (err) {
      console.error('Error secure storage => modify data :', err);
      return null;
    }
  };

  /**
   * @description Returns data from of formatted string passed or `null`
   * @description Accepts data string in the format of `{data, type}`
   */
  getDataFromModifiedString = (str: string) => {
    try {
      if (typeof str !== 'string') {
        throw new Error('Value must be string');
      }
      const template: TemplateData = JSON.parse(str);
      if (
        typeof template !== 'object' ||
        !Object.getOwnPropertyNames(template).includes('data') ||
        !Object.getOwnPropertyNames(template).includes('type')
      ) {
        throw new Error('Invalid data scheme');
      }
      const dataType = typeof template.data;
      template.type = dataType as SupportedTypesString;
      if (dataType === 'symbol' || dataType === 'function') {
        throw new Error('Invalid data type, does not supports function or symbol');
      }
      return template;
    } catch (err) {
      console.error('Error secure storage => get data :', err);
      return null;
    }
  };

  /**
   * @description Validates store by checking any of `local` or `session`
   */
  validateStore = (store: StoreType) => {
    if (typeof store !== 'string' || !storeTypes.includes(store)) {
      throw new Error('Store type must be one of [local, session]');
    }
    if (
      typeof window !== 'object' ||
      typeof window.localStorage !== 'object' ||
      typeof window.sessionStorage !== 'object'
    ) {
      throw new Error('Invalid window, please use only in browser');
    }
  };

  /**
   * @description Validates store by checking any of `local` or `session`
   * @description Validates prefix as `string`
   * @description Validates key as `string`
   */
  preValidations = (prefix: string, key: string, store: StoreType) => {
    if (typeof prefix !== 'string') {
      throw new Error('Prefix is invalid');
    }
    if (typeof key !== 'string') {
      throw new Error('Key must be string');
    }
    this.prefix = this.getPrefix()
    this.validateStore(store);
  };

  /**
   * @description Syncronously removes matched values with matching `prefix`
   */
  matchedClear = (storage: Storage) => {
    try {
      const len = storage.length;
      for (let i = 0; i < len; i++) {
        const key = storage.key(i);
        if (key?.startsWith(`${this.prefix}.`)) {
          storage.removeItem(key);
        }
      }
    } catch (err) {
      console.error('Error secure storage => matched-clear :', err);
    }
  };

  getPrefix = () => {
    try {
      const prefix = mainConfig.prefix;
      if (typeof prefix !== 'string') {
        throw new Error('Invalid prefix, not a string');
      }
      const str = `${prefix}`;
      return str;
    } catch (err) {
      console.error('Error secure storage => prefix :', err);
      return null;
    }
  };
  public prefix = this.getPrefix();

  getModKey = (key: string) => {
    if (typeof this.prefix !== 'string') {
      throw new Error('Prefix is invalid');
    }
    if (typeof key !== 'string') {
      throw new Error('Key must be string');
    }
    const str = `${this.prefix}.${key}`;
    return str;
  };

  /**
   * @description Stores data to store matching `key`
   */
  setItem = (key: string, data: SupportedTypes) => {
    try {
      this.preValidations(this.prefix as string, key, this.store);

      const str = this.modifyDataToString(data);
      if (typeof str !== 'string') {
        return;
      }
      const encrypted = encrypt(str);
      if (typeof encrypted !== 'string') {
        return;
      }
      const modKey = `${this.prefix}.${key}`;
      this.storage.setItem(modKey, encrypted);
    } catch (err) {
      console.error('Error secure storage => setItem :', err);
    }
  };

  /**
   * @description Gets data from store matching `key`
   */
  getItem = <T extends any = SupportedTypes>(key: string) => {
    try {
      this.preValidations(this.prefix as string, key, this.store);

      const modKey = `${this.prefix}.${key}`;
      let str: string | null = null;
      str = this.storage.getItem(modKey);

      const decrypted = decrypt(str as string);
      if (typeof decrypted !== 'string') {
        return null;
      }

      const template = this.getDataFromModifiedString(decrypted);
      if (!template) {
        return null;
      }

      const data = template.data as T;
      return data;
    } catch (err) {
      console.error('Error secure storage => setItem :', err);
      return null;
    }
  };

  /**
   * @description Removes single item from store matching `key`
   */
  removeItem = (key: string) => {
    try {
      this.preValidations(this.prefix as string, key, this.store);

      const modKey = `${this.prefix}.${key}`;
      this.storage.removeItem(modKey);
    } catch (err) {
      console.error('Error secure storage => removeItem :', err);
    }
  };

  /**
   * @description Syncronously removes matched values with matching `prefix`
   */
  clear = () => {
    try {
      this.preValidations(this.prefix as string, '', this.store);
      this.matchedClear(this.storage);
    } catch (err) {
      console.error('Error secure storage => clear :', err);
    }
  };

  /**
   * @description Executes `storage.clear()` to clear complete store
   */
  forceClear = () => {
    try {
      this.preValidations(this.prefix as string, '', this.store);
      this.storage.clear();
    } catch (err) {
      console.error('Error secure storage => force-clear :', err);
    }
  };
}
