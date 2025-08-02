import type { TEffectConfigNumber } from '@/data/types';
import type { TInputSignature } from '../';

import { useRef, useState } from 'react';

/**
 * Range input for number-based effect configurations
 */
export const InputRange = ({ name, item, onChange }: TInputSignature<TEffectConfigNumber>) => {
    const [type, min, current, max, convert, postfix, description] = item as TEffectConfigNumber;
    const [value, setValue] = useState<number>(current);
    const ref = useRef<HTMLInputElement>(null);

    const eventOnChange = () => {
        if (ref.current) {
            const current = parseInt(ref.current.value);

            setValue(current);
            onChange(name, convert(current));
        }
    };

    return (
        <div className="config-item" key={name}>
            <div title={description} key={type}>{name} ({convert(value)}{postfix || ''}):</div>
            <input type="range" {...{ min, max, value, onChange: eventOnChange, ref }} />
        </div>
    );
};
