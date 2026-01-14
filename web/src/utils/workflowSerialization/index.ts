import type { TWorkItem } from '@/data/types';

import { MessageType, WorkItemType } from '@/data/enums';
import { hooks } from '@/modules';
import { listEffects, listModes } from 'imagerot/browser';
import { debug } from '../debug';
import { pick } from '../pick';
import { saveAsAdaptive } from '../saveAsAdaptive';

type TWorkflowExportItem = Pick<TWorkItem, 'key' | 'type' | 'muted' | 'config'>;

type TWorkflowExport = {
    items: TWorkflowExportItem[]
};

const log = debug('app:controls:workflow-serialization');

const workflowToJson = (data: TWorkItem[]): string | null => {
    const items = data.map((item) => {
        return pick(item, ['key', 'type', 'muted', 'config']);
    });

    return items.length > 0 ? JSON.stringify({ items } as TWorkflowExport) : null;
};

const workflowFromJson = (data: string): TWorkflowExportItem[] | null => {
    try {
        const parsed = JSON.parse(data) as TWorkflowExport;

        if (!parsed.items) return null;

        const effects = new Set(listEffects());
        const modes = new Set(listModes());
        const types = new Set(Object.values(WorkItemType));

        return parsed.items.map((item) => {
            const { key, type, muted, config } = item;

            if (!types.has(type)) return null;

            switch (type) {
                case WorkItemType.effect: {
                    return effects.has(key)
                        ? { key, type, muted: muted ?? false, config: config || {} }
                        : null;
                }

                case WorkItemType.mode: {
                    return modes.has(key)
                        ? { key, type, muted: muted ?? false, config: null }
                        : null;
                }

                default:
                    return null;
            }
        }).filter((item) => item !== null) as TWorkflowExportItem[];
    } catch (error) {
        log(error);
        return null;
    }
};

const saveWorkflow = async (workflow: TWorkItem[]) => {
    const converted = workflowToJson(workflow);

    if (converted) {
        const blob = new Blob([converted], { type: 'application/json' });

        if (await saveAsAdaptive(blob, 'workflowExport')) {
            hooks.senders.notify(MessageType.ok, 'Workflow exported');
        }
    }
};

export type { TWorkflowExportItem };
export { workflowToJson, workflowFromJson, saveWorkflow };
