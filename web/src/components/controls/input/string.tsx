import type { TEffectConfigString, TInputSignature } from '@/data/types';

import { useRef } from 'react';

/**
 * String selection for string-based effect configurations
 */
export const InputString = ({ name, item, onChange }: TInputSignature<TEffectConfigString>) => {
    const selectRef = useRef<HTMLSelectElement>(null);

    return (
        <div className="config-item" key={name}>
            <div title={item.desc || ""} key={item.type}>{name}:</div>

            <select ref={selectRef} onChange={() => {
                if (selectRef.current) {
                    onChange(name, selectRef.current.value);
                }
            }}>
                {item.values.map((value, index) => {
                    return <option value={value} key={index}>{value}</option>;
                })}
            </select>
        </div>
    );
};
