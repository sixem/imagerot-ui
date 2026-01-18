import type { TWorkItem, TWorkflowPreset, TWorkflowPresetItem } from '@/data/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components';
import { MessageType, StorageKeys } from '@/data/enums';
import { hooks } from '@/modules';
import { useStoredState } from '@/utils';

import { PresetDetail } from './preset-detail';
import { PresetList } from './preset-list';
import { PresetSave } from './preset-save';

import './index.scss';

type TPresetsModalProps = {
    visible: boolean;
    onClose: () => void;
    workflow: TWorkItem[];
    onLoad: (items: TWorkflowPresetItem[]) => void;
    onAppend: (items: TWorkflowPresetItem[]) => void;
};

const PresetsModal = ({ visible, onClose, workflow, onLoad, onAppend }: TPresetsModalProps) => {
    const [presets, setPresets] = useStoredState<TWorkflowPreset[]>(StorageKeys.workflowPresets, []);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const sortedPresets = useMemo(() => {
        return [...presets].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }, [presets]);

    const selectedPreset = useMemo(() => {
        if (!selectedId) return null;
        return sortedPresets.find((preset) => preset.id === selectedId) ?? null;
    }, [selectedId, sortedPresets]);

    useEffect(() => {
        if (!visible) {
            setSelectedId(null);
        }
    }, [visible]);

    useEffect(() => {
        if (selectedId && !selectedPreset) {
            setSelectedId(null);
        }
    }, [selectedId, selectedPreset]);

    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    const handleSelectAfterDelete = useCallback((deletedId: string) => {
        const index = sortedPresets.findIndex((preset) => preset.id === deletedId);
        if (index === -1) {
            setSelectedId(null);
            return;
        }

        const nextPreset = sortedPresets[index + 1] ?? sortedPresets[index - 1] ?? null;
        setSelectedId(nextPreset ? nextPreset.id : null);
    }, [sortedPresets]);

    const handleLoad = useCallback(() => {
        if (!selectedPreset) return;
        onLoad(selectedPreset.items);
        hooks.senders.notify(MessageType.ok, `Loaded preset "${selectedPreset.name}"`);
        onClose();
    }, [onClose, onLoad, selectedPreset]);

    const handleAppend = useCallback(() => {
        if (!selectedPreset) return;
        onAppend(selectedPreset.items);
        hooks.senders.notify(MessageType.ok, `Appended preset "${selectedPreset.name}"`);
        onClose();
    }, [onAppend, onClose, selectedPreset]);

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title="Presets"
            className="modal-presets"
        >
            <div className="presets-modal">
                <PresetSave
                    visible={visible}
                    workflow={workflow}
                    presets={presets}
                    setPresets={setPresets}
                    onSelect={handleSelect}
                />

                <div className="presets-body">
                    <PresetList
                        presets={sortedPresets}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                    />

                    <PresetDetail
                        preset={selectedPreset}
                        presets={presets}
                        setPresets={setPresets}
                        onSelectAfterDelete={handleSelectAfterDelete}
                        onLoad={handleLoad}
                        onAppend={handleAppend}
                    />
                </div>
            </div>
        </Modal>
    );
};

export { PresetsModal };
