import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

export const storage = {
    get<T = unknown>(key: string) { return idbGet(key) as Promise<T | undefined>; },
    set<T = unknown>(key: string, value: T) { return idbSet(key, value); },
    remove(key: string) { return idbDel(key); },
};
