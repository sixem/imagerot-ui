import type { TEffectChangeEvent, TEffectValue } from '@/data/types';

import { Fragment, memo } from 'react';
import { InputColor, InputRange, InputString } from '../input/';
import { EffectType } from '@/data/enums';

type TSelectionEffectConfigProps = TEffectChangeEvent & {
    path?: string[];
    configValues?: Record<string, TEffectValue>;
};

const SelectionEffectConfig = memo(({ config, onChange, path = [], configValues }: TSelectionEffectConfigProps) => {
    return (
        <Fragment>
            {Object.entries(config).map(([key, item]) => {
                const full = [...path, key];
                const name = full.join('.');
                const value = configValues?.[name];

                switch (item.type) {
                    case EffectType.number: {
                        return (
                            <InputRange
                                key={name}
                                {...{ onChange, name }}
                                item={item}
                                value={typeof value === 'number' ? value : undefined}
                            />
                        );
                    }

                    case EffectType.string: {
                        return (
                            <InputString
                                key={name}
                                {...{ onChange, name }}
                                item={item}
                                value={typeof value === 'string' ? value : undefined}
                            />
                        );
                    }

                    case EffectType.color: {
                        return (
                            <InputColor
                                key={name}
                                {...{ onChange, name }}
                                item={item}
                                value={Array.isArray(value) ? (value as [number, number, number]) : undefined}
                            />
                        );
                    }

                    case EffectType.object: {
                        return (
                            <div className="config-set" key={name}>
                                <SelectionEffectConfig
                                    config={item.values}
                                    onChange={onChange}
                                    path={full}
                                    configValues={configValues}
                                />
                            </div>
                        );
                    }
                }
            })}
        </Fragment>
    );
});

export { SelectionEffectConfig };
