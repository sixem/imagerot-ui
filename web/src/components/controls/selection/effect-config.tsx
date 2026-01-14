import type { TEffectChangeEvent } from '@/data/types';

import { Fragment, memo } from 'react';
import { InputColor, InputRange, InputString } from '../input/';
import { EffectType } from '@/data/enums';

type TSelectionEffectConfigProps = TEffectChangeEvent & { path?: string[] };

const SelectionEffectConfig = memo(({ config, onChange, path = [] }: TSelectionEffectConfigProps) => {
    return (
        <Fragment>
            {Object.entries(config).map(([key, item]) => {
                const full = [...path, key];
                const name = full.join('.');

                switch (item.type) {
                    case EffectType.number: {
                        return <InputRange key={name} {...{ onChange, name }} item={item} />;
                    }

                    case EffectType.string: {
                        return <InputString key={name} {...{ onChange, name }} item={item} />;
                    }

                    case EffectType.color: {
                        return <InputColor key={name} {...{ onChange, name }} item={item} />;
                    }

                    case EffectType.object: {
                        return (
                            <div className="config-set" key={name}>
                                <SelectionEffectConfig
                                    config={item.values}
                                    onChange={onChange}
                                    path={full}
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
