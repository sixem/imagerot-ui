import type { TEffectItem, TEffectValue } from '@/data/types';

import type { ChangeEvent } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

const DEFAULT_DESCRIPTION = 'Adds the selected effect to the workflow.';

const SelectionEffect = ({ onAdd }: { onAdd: (effect: string, config: { [key: string]: TEffectValue }) => void; }) => {
    const [selectedKey, setSelectedKey] = useState<string>(EFFECT_DEFAULT);
    const [configState, setConfigState] = useState<{ [key: string]: TEffectValue }>({});

    const selectedEffect = useMemo<TEffectItem | null>(() => {
        return selectedKey && Effects[selectedKey] ? Effects[selectedKey] : null;
    }, [selectedKey]);

    const effectOptions = useMemo(() => {
        return EFFECT_KEYS
            .filter((key) => EFFECT_VALID.has(key))
            .map((key) => ({ key, label: Effects[key]?.format || key }));
    }, []);

    const handleConfigChange = useCallback((name: string, value: TEffectValue) => {
        setConfigState(previous => ({ ...previous, [name]: value }));
    }, []);

    const handleEffectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedKey(event.currentTarget.value);
    }, []);

    useEffect(() => {
        if (selectedEffect?.config) {
            setConfigState(readConfigDefaults(selectedEffect.config));
        } else {
            setConfigState({});
        }
    }, [selectedEffect]);

    const handleAdd = useCallback(() => {
        if (selectedKey && selectedEffect) {
            onAdd(selectedKey, configState);
        }
    }, [configState, onAdd, selectedEffect, selectedKey]);

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" onChange={handleEffectChange} value={selectedKey}>
                {effectOptions.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>

            <div className="description">
                <span>{selectedEffect?.description ?? DEFAULT_DESCRIPTION}</span>
            </div>

            {selectedEffect?.config ? (
                <div className="configuration">
                    <SelectionEffectConfig
                        config={selectedEffect.config}
                        onChange={handleConfigChange}
                    />
                </div>
            ) : null}

            <Button text={"Add effect to workflow"} icon={"add"} onClick={handleAdd} />
        </div>
    );
};

export { SelectionEffect };
