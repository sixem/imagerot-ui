import type { ChangeEvent } from 'react';
import type { TEffectConfigNumber, TInputSignature } from '@/data/types';

import { useEffect, useId, useState, useCallback } from 'react';

export const InputRange = ({ name, item, onChange }: TInputSignature<TEffectConfigNumber>) => {
    const [value, setValue] = useState<number>(item.current);
    const id = useId();

    useEffect(() => {
        const clamped = Math.min(item.max, Math.max(item.min, item.current));
        setValue(clamped);
    }, [item.current, item.min, item.max]);

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
            <label htmlFor={id} title={item.desc ?? ''}>
                {name} ({derived}{item.unit ?? ''}):
            </label>

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
