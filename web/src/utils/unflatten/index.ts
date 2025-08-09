import type { TEffectValue } from '@/data/types';

export const unflatten = (flat: { [key: string]: TEffectValue } | null) => {
    if (!flat) {
        return null;
    }

    const root: any = {};

    for (const [path, value] of Object.entries(flat)) {
        const parts = path.split('.');
        let cur = root as any;

        for (let i = 0; i < parts.length - 1; i++) {
            cur = cur[parts[i]] ?? (cur[parts[i]] = {});
        }

        cur[parts[parts.length - 1]] = value;
    }

    return root;
};