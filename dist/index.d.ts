type SupportedTypes = boolean | object | null | undefined | string | number | bigint;
type SupportedTypesString = 'boolean' | 'number' | 'bigint' | 'string' | 'object' | 'undefined';
type TemplateData = {
    data: SupportedTypes;
    type: SupportedTypesString;
};
declare const storeTypes: readonly ["local", "session"];
type StoreType = (typeof storeTypes)[number];
declare class Store<S extends StoreType> {
    private store;
    private storage;
    constructor(store?: S);
    /**
     * @description Returns string format of data passed or `null`
     * @description Modifies in the format of `{data, type}`
     */
    modifyDataToString: (data: any) => string | null;
    /**
     * @description Returns data from of formatted string passed or `null`
     * @description Accepts data string in the format of `{data, type}`
     */
    getDataFromModifiedString: (str: string) => TemplateData | null;
    /**
     * @description Validates store by checking any of `local` or `session`
     */
    validateStore: (store: StoreType) => void;
    /**
     * @description Validates store by checking any of `local` or `session`
     * @description Validates prefix as `string`
     * @description Validates key as `string`
     */
    preValidations: (prefix: string, key: string, store: StoreType) => void;
    /**
     * @description Syncronously removes matched values with matching `prefix`
     */
    matchedClear: (storage: Storage) => void;
    getPrefix: () => string | null;
    prefix: string | null;
    getModKey: (key: string) => string;
    /**
     * @description Stores data to store matching `key`
     */
    setItem: (key: string, data: SupportedTypes) => void;
    /**
     * @description Gets data from store matching `key`
     */
    getItem: <T extends any = SupportedTypes>(key: string) => T | null;
    /**
     * @description Removes single item from store matching `key`
     */
    removeItem: (key: string) => void;
    /**
     * @description Syncronously removes matched values with matching `prefix`
     */
    clear: () => void;
    /**
     * @description Executes `storage.clear()` to clear complete store
     */
    forceClear: () => void;
}

type Config = {
    /** @description The secret hash will be used for AES encryption */
    secret: string;
    /**
     * @description The prefix which will prepend on every key in the storage as `{prefix}.{key}`
     */
    prefix: string;
};
declare const configure: (config?: Partial<Config>) => void;

declare const localStorage: Store<"local">;
declare const sessionStorage: Store<"session">;

export { configure, localStorage, sessionStorage };
