import type { TEffectValue } from '@/data/types';

export const unflatten = (flat: { [key: string]: TEffectValue } | null): Record<string, unknown> | null => {
    if (!flat) {
        return null;
    }

    const root: Record<string, unknown> = {};

    for (const [path, value] of Object.entries(flat)) {
        const parts = path.split('.');
        let cur: Record<string, unknown> = root;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            cur = (cur[part] ?? (cur[part] = {})) as Record<string, unknown>;
        }

        cur[parts[parts.length - 1]] = value;
    }

    return root;
};
