import type { TEffectValue, TWorkItem } from '@/data/types';

import { uid } from '../uid';

type TWorkItemCreator = (
    key: string,
    type: TWorkItem['type'],
    configuration: { [key: string]: TEffectValue; } | null
) => TWorkItem;

const createWorkItem: TWorkItemCreator = (key, type, configuration) => {
    return { key, config: configuration, type, id: uid(), muted: false };
};

export { createWorkItem };
