import { Tooltip } from '@/components/tooltips';
import type { TEffectConfigString, TInputSignature } from '@/data/types';

/**
 * String selection for string-based effect configurations
 */
export const InputString = ({
    name,
    item,
    onChange,
    value
}: TInputSignature<TEffectConfigString, string>) => {
    const selectedValue = typeof value === 'string' ? value : (item.values[0] ?? '');

    return (
        <div className="config-item" key={name}>
            <div key={item.type}>
                <Tooltip text={item.desc || ""}>
                    <span>{name}:</span>
                </Tooltip>
            </div>

            <select
                value={selectedValue}
                onChange={(event) => {
                    onChange(name, event.currentTarget.value);
                }}
            >
                {item.values.map((value, index) => {
                    return <option value={value} key={index}>{value}</option>;
                })}
            </select>
        </div>
    );
};
