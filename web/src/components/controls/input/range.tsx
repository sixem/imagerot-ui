import type { ChangeEvent } from 'react';
import type { TEffectConfigNumber, TInputSignature } from '@/data/types';

import { useEffect, useId, useState, useCallback } from 'react';
import { Tooltip } from '@/components/tooltips';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Effects store transformed values; map back to the closest slider tick for editing.
const resolveValue = (item: TEffectConfigNumber, value?: number) => {
    const fallback = clamp(item.current, item.min, item.max);

    if (typeof value !== 'number' || Number.isNaN(value)) {
        return fallback;
    }

    const min = Math.ceil(item.min);
    const max = Math.floor(item.max);

    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
        return fallback;
    }

    let best = fallback;
    let bestDiff = Math.abs(item.f(best) - value);

    for (let current = min; current <= max; current += 1) {
        const diff = Math.abs(item.f(current) - value);
        if (diff < bestDiff) {
            best = current;
            bestDiff = diff;
            if (bestDiff === 0) break;
        }
    }

    return best;
};

export const InputRange = ({ name, item, onChange, value: targetValue }: TInputSignature<TEffectConfigNumber, number>) => {
    const [value, setValue] = useState<number>(resolveValue(item, targetValue));
    const id = useId();

    useEffect(() => {
        setValue(resolveValue(item, targetValue));
    }, [item, targetValue]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const v = e.currentTarget.valueAsNumber;
            setValue(v);
            onChange(name, item.f(v));
        },
        [name, onChange, item]
    );

    const derived = item.f(value);

    return (
        <div className="config-item item-range">
            <Tooltip text={item.desc ?? ''}>
                <label htmlFor={id}>
                    {name} ({derived}{item.unit ?? ''}):
                </label>
            </Tooltip>

            <input
                id={id}
                type="range"
                min={item.min}
                max={item.max}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
};
