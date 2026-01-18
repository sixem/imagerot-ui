import type { ChangeEvent, KeyboardEvent } from 'react';
import type { TWorkItem, TWorkflowPreset, TWorkflowPresetItem } from '@/data/types';
import type { TPresetsSetter } from './types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ButtonSet } from '@/components';
import { MessageType } from '@/data/enums';
import { hooks } from '@/modules';
import { uid } from '@/utils';
import { buildPresetItems } from './utils';

type TPresetSaveProps = {
    visible: boolean;
    workflow: TWorkItem[];
    presets: TWorkflowPreset[];
    setPresets: TPresetsSetter;
    onSelect: (id: string) => void;
};

type TPendingOverwrite = {
    id: string;
    existingName: string;
    newName: string;
    items: TWorkflowPresetItem[];
};

const PresetSave = ({ visible, workflow, presets, setPresets, onSelect }: TPresetSaveProps) => {
    const [presetName, setPresetName] = useState<string>('');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [pendingOverwrite, setPendingOverwrite] = useState<TPendingOverwrite | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (!visible) {
            setPresetName('');
            setSaveError(null);
            setPendingOverwrite(null);
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const timeout = setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);

        return () => clearTimeout(timeout);
    }, [visible]);

    const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPresetName(event.currentTarget.value);
        setSaveError(null);
        setPendingOverwrite(null);
    }, []);

    const handleSave = useCallback(() => {
        if (workflow.length === 0) {
            setSaveError('Add workflow items before saving a preset.');
            return;
        }

        const trimmed = presetName.trim();
        if (!trimmed) {
            setSaveError('Preset name is required.');
            return;
        }

        const items = buildPresetItems(workflow);
        const existing = presets.find(
            (preset) => preset.name.toLowerCase() === trimmed.toLowerCase()
        );

        if (existing) {
            setPendingOverwrite({
                id: existing.id,
                existingName: existing.name,
                newName: trimmed,
                items
            });
            return;
        }

        const nextPreset: TWorkflowPreset = {
            id: uid(),
            name: trimmed,
            items,
            updatedAt: Date.now()
        };

        setPresets((prev) => [nextPreset, ...prev]);
        setPresetName('');
        setSaveError(null);
        onSelect(nextPreset.id);
        hooks.senders.notify(MessageType.ok, 'Preset saved');
    }, [presetName, presets, setPresets, workflow, onSelect]);

    const handleNameKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    const confirmOverwrite = useCallback(() => {
        if (!pendingOverwrite) return;

        const nextPreset: TWorkflowPreset = {
            id: pendingOverwrite.id,
            name: pendingOverwrite.newName,
            items: pendingOverwrite.items,
            updatedAt: Date.now()
        };

        setPresets((prev) => prev.map((preset) => (
            preset.id === pendingOverwrite.id ? nextPreset : preset
        )));
        setPendingOverwrite(null);
        setPresetName('');
        onSelect(nextPreset.id);
        hooks.senders.notify(MessageType.ok, 'Preset updated');
    }, [pendingOverwrite, setPresets, onSelect]);

    const cancelOverwrite = useCallback(() => {
        setPendingOverwrite(null);
    }, []);

    return (
        <div className="presets-create">
            <div className="create-controls">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Name this preset"
                    value={presetName}
                    onChange={handleNameChange}
                    onKeyDown={handleNameKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                />
                <Button
                    text="Save preset"
                    onClick={handleSave}
                    disabled={workflow.length === 0}
                />
            </div>

            {saveError ? (
                <div className="presets-alert error">{saveError}</div>
            ) : null}

            {pendingOverwrite ? (
                <div className="presets-alert warn">
                    <span>
                        Preset "{pendingOverwrite.existingName}" already exists. Overwrite?
                    </span>
                    <ButtonSet items={[
                        { text: 'Cancel', onClick: cancelOverwrite },
                        { text: 'Overwrite', onClick: confirmOverwrite }
                    ]} />
                </div>
            ) : null}
        </div>
    );
};

export { PresetSave };
