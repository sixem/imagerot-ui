import type { KeyboardEvent } from 'react';
import type { TWorkflowPreset } from '@/data/types';
import type { TPresetsSetter } from './types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonSet } from '@/components';
import { MessageType, WorkItemType } from '@/data/enums';
import { hooks } from '@/modules';
import { countItems, formatCount } from './utils';

type TPresetDetailProps = {
    preset: TWorkflowPreset | null;
    presets: TWorkflowPreset[];
    setPresets: TPresetsSetter;
    onSelectAfterDelete: (deletedId: string) => void;
    onLoad: () => void;
    onAppend: () => void;
};

type TRenameState = {
    id: string;
    value: string;
    error: string | null;
};

type TPendingDelete = {
    id: string;
    name: string;
};

const PresetDetail = ({
    preset,
    presets,
    setPresets,
    onSelectAfterDelete,
    onLoad,
    onAppend
}: TPresetDetailProps) => {
    const [renameState, setRenameState] = useState<TRenameState | null>(null);
    const [pendingDelete, setPendingDelete] = useState<TPendingDelete | null>(null);
    const renameInputRef = useRef<HTMLInputElement | null>(null);

    const counts = useMemo(() => (preset ? countItems(preset.items) : null), [preset]);

    useEffect(() => {
        setRenameState(null);
        setPendingDelete(null);
    }, [preset?.id]);

    useEffect(() => {
        if (!renameState) return;
        const timeout = setTimeout(() => {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }, 0);

        return () => clearTimeout(timeout);
    }, [renameState]);

    const handleRenameStart = useCallback(() => {
        if (!preset) return;
        setRenameState({ id: preset.id, value: preset.name, error: null });
    }, [preset]);

    const handleRenameCancel = useCallback(() => {
        setRenameState(null);
    }, []);

    const handleRenameChange = useCallback((nextValue: string) => {
        setRenameState((prev) => prev ? { ...prev, value: nextValue, error: null } : prev);
    }, []);

    const handleRenameConfirm = useCallback(() => {
        if (!renameState) return;

        const trimmed = renameState.value.trim();
        if (!trimmed) {
            setRenameState({ ...renameState, error: 'Preset name is required.' });
            return;
        }

        const existing = presets.find(
            (presetItem) => presetItem.name.toLowerCase() === trimmed.toLowerCase()
        );

        if (existing && existing.id !== renameState.id) {
            setRenameState({ ...renameState, error: 'A preset with this name already exists.' });
            return;
        }

        setPresets((prev) => prev.map((presetItem) => (
            presetItem.id === renameState.id
                ? { ...presetItem, name: trimmed, updatedAt: Date.now() }
                : presetItem
        )));

        setRenameState(null);
        hooks.senders.notify(MessageType.ok, 'Preset renamed');
    }, [presets, renameState, setPresets]);

    const handleRenameKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleRenameConfirm();
        }
    }, [handleRenameConfirm]);

    const handleDeleteRequest = useCallback(() => {
        if (!preset) return;
        setPendingDelete({ id: preset.id, name: preset.name });
    }, [preset]);

    const handleDeleteConfirm = useCallback(() => {
        if (!pendingDelete) return;
        setPresets((prev) => prev.filter((presetItem) => presetItem.id !== pendingDelete.id));
        onSelectAfterDelete(pendingDelete.id);
        setPendingDelete(null);
        setRenameState(null);
        hooks.senders.notify(MessageType.ok, 'Preset deleted');
    }, [pendingDelete, onSelectAfterDelete, setPresets]);

    const handleDeleteCancel = useCallback(() => {
        setPendingDelete(null);
    }, []);

    return (
        <div className="presets-panel presets-detail">
            <div className="panel-header">
                <div className="title">Details</div>
            </div>
            <div className="panel-body">
                {preset && counts ? (
                    <>
                        <div className="detail-summary">
                            <div className="name">{preset.name}</div>
                            <div className="meta">
                                {formatCount(counts.effects, 'effect')}
                                {' - '}
                                {formatCount(counts.modes, 'mode')}
                            </div>
                        </div>

                        <div className="detail-actions">
                            <div className="action-primary">
                                <Button text="Load" onClick={onLoad} />
                                <Button text="Append" onClick={onAppend} />
                                <Button
                                    text={renameState ? 'Cancel rename' : 'Rename'}
                                    onClick={renameState ? handleRenameCancel : handleRenameStart}
                                />
                            </div>
                            <div className="action-danger">
                                <Button
                                    text={null}
                                    icon="trash"
                                    tooltip="Delete preset"
                                    onClick={handleDeleteRequest}
                                />
                            </div>
                        </div>

                        {renameState ? (
                            <>
                                <div className="rename-row">
                                    <input
                                        ref={renameInputRef}
                                        type="text"
                                        value={renameState.value}
                                        onChange={(event) => handleRenameChange(event.currentTarget.value)}
                                        onKeyDown={handleRenameKeyDown}
                                        autoFocus
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                    />
                                    <Button
                                        text={null}
                                        icon="check"
                                        tooltip="Save name"
                                        onClick={handleRenameConfirm}
                                    />
                                </div>
                                {renameState.error ? (
                                    <div className="presets-alert error">{renameState.error}</div>
                                ) : null}
                            </>
                        ) : null}

                        {pendingDelete && pendingDelete.id === preset.id ? (
                            <div className="presets-alert warn">
                                <span>Delete preset "{pendingDelete.name}"?</span>
                                <ButtonSet items={[
                                    { text: 'Cancel', onClick: handleDeleteCancel },
                                    { text: 'Delete', onClick: handleDeleteConfirm }
                                ]} />
                            </div>
                        ) : null}

                        <div className="detail-list">
                            {preset.items.map((item, index) => (
                                <div
                                    key={`${item.type}-${item.key}-${index}`}
                                    className={`detail-item${item.type === WorkItemType.effect ? ' type-effect' : ' type-mode'}`}
                                >
                                    <span className="kind">
                                        {item.type === WorkItemType.effect ? 'Effect' : 'Mode'}
                                    </span>
                                    <span className="label">{item.key}</span>
                                    {item.muted ? (
                                        <span className="muted">Muted</span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="preset-empty">
                        Select a preset to preview its items.
                    </div>
                )}
            </div>
        </div>
    );
};

export { PresetDetail };
