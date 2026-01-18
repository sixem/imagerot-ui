import type { TEffectItem, TEffectValue, TWorkItem } from '@/data/types';

import type { ChangeEvent } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet } from '@/components';
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

const DEFAULT_DESCRIPTION = 'Adds this effect to the workflow.';

type TSelectionEffectProps = {
    onAdd: (effect: string, config: { [key: string]: TEffectValue }) => void;
    onUpdate: (id: string, config: { [key: string]: TEffectValue }) => void;
    onCancelEdit: () => void;
    editingEffect: TWorkItem | null;
};

const SelectionEffect = ({ onAdd, onUpdate, onCancelEdit, editingEffect }: TSelectionEffectProps) => {
    const [selectedKey, setSelectedKey] = useState<string>(EFFECT_DEFAULT);
    const [draftConfig, setDraftConfig] = useState<{ [key: string]: TEffectValue }>({});
    const isEditing = !!editingEffect;
    const editingKey = editingEffect?.key ?? null;
    const editingConfig = editingEffect?.config ?? null;

    const selectedEffect = useMemo<TEffectItem | null>(() => {
        return selectedKey && Effects[selectedKey] ? Effects[selectedKey] : null;
    }, [selectedKey]);

    const effectOptions = useMemo(() => {
        return EFFECT_KEYS
            .filter((key) => EFFECT_VALID.has(key))
            .map((key) => ({ key, label: Effects[key]?.format || key }));
    }, []);

    const handleConfigChange = useCallback((name: string, value: TEffectValue) => {
        setDraftConfig(previous => ({ ...previous, [name]: value }));
    }, []);

    const handleEffectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedKey(event.currentTarget.value);
    }, []);

    // Merge saved values over defaults so new fields keep sensible defaults.
    useEffect(() => {
        if (selectedEffect?.config) {
            const defaults = readConfigDefaults(selectedEffect.config);
            setDraftConfig(editingConfig ? { ...defaults, ...editingConfig } : defaults);
        } else if (editingConfig) {
            setDraftConfig({ ...editingConfig });
        } else {
            setDraftConfig({});
        }
    }, [selectedEffect, editingConfig]);

    useEffect(() => {
        if (editingKey) {
            setSelectedKey(editingKey);
        }
    }, [editingKey]);

    const handleAdd = useCallback(() => {
        if (selectedKey && selectedEffect) {
            onAdd(selectedKey, draftConfig);
        }
    }, [draftConfig, onAdd, selectedEffect, selectedKey]);

    const handleSave = useCallback(() => {
        if (editingEffect) {
            onUpdate(editingEffect.id, draftConfig);
        }
    }, [draftConfig, editingEffect, onUpdate]);

    const handleCancel = useCallback(() => {
        onCancelEdit();
        setSelectedKey(EFFECT_DEFAULT);
    }, [onCancelEdit]);

    const description = selectedEffect?.description ?? DEFAULT_DESCRIPTION;
    const isConfigurable = !!selectedEffect?.config;

    return (
        <div className="section selection-effect">
            <div className="sub-header">Choose effect:</div>

            <select name="effect-select" onChange={handleEffectChange} value={selectedKey} disabled={isEditing}>
                {effectOptions.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>

            <div className="description">
                <span>{description}</span>
            </div>

            {isConfigurable ? (
                <div className="configuration">
                    <SelectionEffectConfig
                        config={selectedEffect.config}
                        onChange={handleConfigChange}
                        configValues={draftConfig}
                    />
                </div>
            ) : null}

            {isEditing ? (
                <ButtonSet items={[
                    { text: 'Save changes', onClick: handleSave },
                    { text: 'Cancel', onClick: handleCancel, style: { flex: '0 0 auto' } }
                ]} />
            ) : (
                <Button text={"Add effect"} icon={"add"} onClick={handleAdd} />
            )}
        </div>
    );
};

export { SelectionEffect };
