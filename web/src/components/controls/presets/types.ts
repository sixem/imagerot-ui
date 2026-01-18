import type { TWorkflowPreset } from '@/data/types';

export type TPresetsSetter = (
    value: TWorkflowPreset[] | ((prev: TWorkflowPreset[]) => TWorkflowPreset[])
) => void;
