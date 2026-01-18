import type { TEffectValue, TPaneSignature, TWorkItem } from '@/data/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { InputFile } from './input/';
import { createWorkItem, debug, getImageDimensions } from '@/utils';
import { WorkItemType } from '@/data/enums';
import { Actions } from './actions';
import { Workflow } from './workflow';
import { Header } from './header';
import { SelectionEffect } from './selection/effect';
import { SelectionMode } from './selection/mode';
import { estimates } from '@/modules';

import './index.scss';

const log = debug('app:controls');

/**
 * Controls container
 * 
 * Contains file inputs, selections of modes and effects and the workflow
 */
const Controls = ({ current, setters, busy }: TPaneSignature) => {
    const [estimated, setEstimated] = useState<number | null>(null);
    const [workflow, setWorkflow] = useState<TWorkItem[]>([]);
    const [dimensions, setDimensions] = useState<[number, number] | null>(null);
    // Track the workflow effect currently being edited in the selector.
    const [editingEffectId, setEditingEffectId] = useState<string | null>(null);

    const editingEffect = useMemo(() => {
        if (!editingEffectId) return null;
        return workflow.find((item) => item.id === editingEffectId && item.type === WorkItemType.effect) ?? null;
    }, [editingEffectId, workflow]);

    const activeWorkflow = useMemo(() => {
        const effects: string[] = [];
        const modes: string[] = [];

        for (const item of workflow) {
            if (item.muted) continue;
            if (item.type === WorkItemType.effect) effects.push(item.key);
            if (item.type === WorkItemType.mode) modes.push(item.key);
        }

        return { effects, modes };
    }, [workflow]);

    useEffect(() => {
        if (editingEffectId && !editingEffect) {
            setEditingEffectId(null);
        }
    }, [editingEffect, editingEffectId]);

    const handleSelectEffect = useCallback((item: TWorkItem) => {
        if (item.type !== WorkItemType.effect) return;
        setEditingEffectId((previous) => (previous === item.id ? null : item.id));
    }, []);

    const handleAddEffect = useCallback((effect: string, config: { [key: string]: TEffectValue }) => {
        setWorkflow((previous) => [...previous, createWorkItem(
            effect, WorkItemType.effect, config
        )]);
    }, []);

    const handleUpdateEffect = useCallback((id: string, config: { [key: string]: TEffectValue }) => {
        setWorkflow((previous) => previous.map((item) => {
            if (item.id === id) {
                return { ...item, config };
            }
            return item;
        }));
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingEffectId(null);
    }, []);

    useEffect(() => {
        let alive = true;

        if (!current.loaded) {
            setDimensions(null);
            return () => { alive = false; };
        }

        getImageDimensions(current.loaded.url).then(({ width, height }) => {
            if (!alive) return;
            setDimensions([width, height]);
        }).catch(() => {
            if (alive) setDimensions(null);
        });

        return () => { alive = false; };
    }, [current.loaded?.id]);

    useEffect(() => {
        if (!dimensions) {
            setEstimated(null);
            return;
        }

        const estimatedMs = estimates.getEstimate(dimensions, {
            effects : activeWorkflow.effects,
            modes   : activeWorkflow.modes
        });

        if (estimatedMs) {
            log("Estimated processing (ms)", Math.round(estimatedMs * 100) / 100);
        }

        setEstimated(estimatedMs);
    }, [dimensions, activeWorkflow]);

    return (
        <div className="controls">
            <div className="top">
                <Header />

                <div className="section">
                    <InputFile setter={setters.file} />
                </div>

                <SelectionMode onAdd={(mode) => {
                    setWorkflow(previous => [...previous, createWorkItem(
                        mode, WorkItemType.mode, null
                    )]);
                }} />

                <SelectionEffect
                    onAdd={handleAddEffect}
                    onUpdate={handleUpdateEffect}
                    onCancelEdit={handleCancelEdit}
                    editingEffect={editingEffect}
                />

                <Workflow
                    workflow={workflow}
                    setWorkflow={setWorkflow}
                    selectedId={editingEffectId}
                    onSelect={handleSelectEffect}
                />
            </div>
            <div className="bottom">
                <Actions
                    setters={{...setters, workflow: setWorkflow}}
                    {...{ busy, estimated, workflow, current }}
                />
            </div>
        </div>
    );
};

export { Controls };
