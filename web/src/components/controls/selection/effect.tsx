import type { TEffectItem, TEffectValue } from '@/data/types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components';
import { Effects } from '@/data/';
import { listEffects } from 'imagerot/browser';
import { config } from '@/config';
import { pickDefault, readConfigDefaults } from '@/utils';
import { SelectionEffectConfig } from './effect-config';

const EFFECT_VALID = new Set(listEffects());
const EFFECT_KEYS = Object.keys(Effects).sort();
const EFFECT_DEFAULT = pickDefault(
    EFFECT_KEYS,
    EFFECT_VALID,
    config?.selections?.defaults?.effect as typeof EFFECT_KEYS[number] | null | undefined
);

const SelectionEffect = ({ onAdd }: { onAdd: (effect: string, config: { [key: string]: TEffectValue }) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<{ key: string; value: TEffectItem; } | null>(null);
    const [configState, setConfigState] = useState<{ [key: string]: TEffectValue }>({});

    const handleConfigChange = useCallback((name: string, value: TEffectValue) => {
        setConfigState(previous => ({ ...previous, [name]: value }));
    }, []);

    const handleEffectChange = useCallback(() => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (Effects[value]) {
                setSelected({ key: value, value: Effects[value] });
            }
        }
    }, []);

    useEffect(() => {
        if (selected?.value?.config) {
            setConfigState(readConfigDefaults(selected.value.config));
        } else {
            setConfigState({});
        }
    }, [selected]);

    useEffect(() => handleEffectChange(), [handleEffectChange]);

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={handleEffectChange} value={selected?.key ?? EFFECT_DEFAULT}>
                {(EFFECT_KEYS.map((key) => {
                    return EFFECT_VALID.has(key) ? (
                        <option key={key} value={key}>{Effects[key]?.format || key}</option>
                    ) : null;
                }))}
            </select>

            <div className="description">
                <span>{selected?.value?.description ?? "Adds the selected effect to the workflow."}</span>
            </div>

            {selected?.value?.config ? (
                <div className="configuration">
                    <SelectionEffectConfig
                        config={selected.value.config}
                        onChange={handleConfigChange}
                    />
                </div>
            ) : null}

            <Button text={"Add effect to workflow"} icon={"add"} onClick={() => {
                if (selected) {
                    onAdd(selected.key, configState);
                }
            }} />
        </div>
    );
};

export { SelectionEffect };
