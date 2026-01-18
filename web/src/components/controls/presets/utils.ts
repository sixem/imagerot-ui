import type { TWorkItem, TWorkflowPresetItem } from '@/data/types';

import { WorkItemType } from '@/data/enums';

const buildPresetItems = (workflow: TWorkItem[]): TWorkflowPresetItem[] => {
    return workflow.map((item) => ({
        key: item.key,
        type: item.type,
        muted: !!item.muted,
        config: item.config
    }));
};

const countItems = (items: TWorkflowPresetItem[]) => {
    let effects = 0;
    let modes = 0;

    for (const item of items) {
        if (item.type === WorkItemType.effect) {
            effects += 1;
        } else {
            modes += 1;
        }
    }

    return { effects, modes };
};

const formatCount = (count: number, label: string) => {
    return `${count} ${label}${count === 1 ? '' : 's'}`;
};

export { buildPresetItems, countItems, formatCount };
