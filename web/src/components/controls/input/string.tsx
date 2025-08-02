import type { TEffectConfigString } from '@/data/types';
import type { TInputSignature } from '../';

import { useRef } from 'react';

/**
 * String selection for string-based effect configurations
 */
export const InputString = ({ name, item, onChange }: TInputSignature<TEffectConfigString>) => {
    const [type, values, description] = item as TEffectConfigString;
    const selectRef = useRef<HTMLSelectElement>(null);

    return (
        <div className="config-item" key={name}>
            <div title={description} key={type}>{name}:</div>

            <select ref={selectRef} onChange={() => {
                if (selectRef.current) {
                    onChange(name, selectRef.current.value);
                }
            }}>
                {values.map((value) => {
                    return <option value={value}>{value}</option>;
                })}
            </select>
        </div>
    );
};
