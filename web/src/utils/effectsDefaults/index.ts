import type { TEffectConfigItem, TEffectValue } from '@/data/types';

import { EffectType } from '@/data/enums';

const pickDefault = <T extends string>(
    keys: readonly T[],
    valid: ReadonlySet<T>,
    preferred?: T | null | undefined
): (T | '') => {
    return preferred && keys.includes(preferred) && valid.has(preferred)
        ? preferred
        : (keys.find(k => valid.has(k)) ?? '');
};

const getDefaultValue = (config: TEffectConfigItem): TEffectValue | null => {
    switch (config.type) {
        case EffectType.number:
            return config.f(config.current);
        case EffectType.color:
            return config.current;
        case EffectType.string:
            return config.values.length > 0 ? config.values[0] : null;
        default:
            return null;
    }
};

const readConfigDefaults = (config: { [key: string]: TEffectConfigItem; }) => {
    const out: { [key: string]: TEffectValue } = {};

    const walk = (node: { [key: string]: TEffectConfigItem }, path: string[]) => {
        for (const [key, item] of Object.entries(node || {})) {
            const full = [...path, key];
            const name = full.join('.');

            switch (item.type) {
                case EffectType.object: {
                    walk(item.values, full);
                    break;
                }
                case EffectType.number:
                case EffectType.string:
                case EffectType.color: {
                    const value = getDefaultValue(item);
                    if (value !== null) {
                        out[name] = value as TEffectValue;
                    }
                    break;
                }
            }
        }
    };

    walk(config || {}, []);

    return out;
};

export { pickDefault, getDefaultValue, readConfigDefaults };
