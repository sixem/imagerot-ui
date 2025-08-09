import type { TEffectConfigNumber, TInputSignature } from '@/data/types';

import { useEffect, useState } from 'react';

export const InputRange = ({ name, item, onChange }: TInputSignature<TEffectConfigNumber>) => {
    const [value, setValue] = useState<number>(item.current);

    useEffect(() => {
        if (value !== item.current) {
            setValue(item.current);
        }
    }, [item.current]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.valueAsNumber;
        setValue(value);
        onChange(name, item.f(value));
    };

    const derived = item.f(value);

    return (
        <div className="config-item item-range">
            <div title={item.desc ?? ''}>
                {name} ({derived}{item.unit ?? ''}):
            </div>
            
            <input
                type="range"
                min={item.min}
                max={item.max}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
};
