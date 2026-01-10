import { WorkItemType, EffectType } from './enums';

type Dict<T> = Record<string, T>;
type ValueOf<T> = T[keyof T];
type RGB = [number, number, number];

export type TEffectValue =
    | number
    | string
    | RGB
    | { [key: string]: TEffectValue };

export type TEffects = Dict<TEffectItem>;
export type TEffectType = ValueOf<typeof EffectType>;

type WithDesc = { desc?: string };

export type TEffectConfigObject = {
    type: typeof EffectType.object;
    values: Dict<TEffectConfigItem>;
} & WithDesc;

export type TEffectConfigColor = {
    type: typeof EffectType.color;
    current: RGB;
} & WithDesc;

export type TEffectConfigNumber = {
    type: typeof EffectType.number;
    min: number;
    current: number;
    max: number;
    unit?: string;
    f: (n: number) => number;
} & WithDesc;

export type TEffectConfigString = {
    type: typeof EffectType.string;
    values: readonly string[];
} & WithDesc;

export type TEffectConfigItem =
    | TEffectConfigString
    | TEffectConfigColor
    | TEffectConfigObject
    | TEffectConfigNumber;

export type TEffectItem = {
    description?: string;
    format?: string;
    config: Dict<TEffectConfigItem> | null;
};

export type TModeItem = {
    format: string;
    description: string;
};
export type TModes = Dict<TModeItem>;

export type TImageFile = {
    file: File | null;
    url: string;
    size: number | null;
    dimensions?: [number, number];
    id: string;
};

export type TPaneSignature = {
    setters: {
        file: (image: TImageFile | null) => void;
        edit: (image: TImageFile | null) => void;
    };
    current: {
        loaded: TImageFile | null;
        edited: TImageFile | null;
    };
    busy: {
        state: boolean;
        update: (state: boolean) => void;
    };
};

export type TEffectChangeEvent = {
    config: Dict<TEffectConfigItem>;
    onChange: (name: string, value: TEffectValue) => void;
};

export type TInputSignature<TItem extends TEffectConfigItem = TEffectConfigNumber> = {
    name: string;
    item: TItem;
    onChange: TEffectChangeEvent['onChange'];
};

export type TWorkItem = {
    key: string;
    type: ValueOf<typeof WorkItemType>;
    config: null | Dict<TEffectValue>;
    id: string;
    muted?: boolean;
};

export interface TProcessorInput {
    image: {
        buffer: ArrayBuffer;
        name: string;
        type: string;
        size: number;
        id: string;
    };
    workflow: TWorkItem[];
}
export interface TProcessorOutput {
    image: TImageFile;
    estimates: TEstimateRecord;
    overhead: number;
}

export type TNotifyItem = {
    type: number;
    message: string;
    id: number;
    visible: boolean;
    duration?: number;
};

export type TBucketKeys = 'modes' | 'effects';
export type TEstimateRecord = Record<TBucketKeys, Record<string, number[]>>;

export type TEstimateTable = Record<
    TBucketKeys,
    Record<
        string, {
            measurements: number[];
            averagePpms: number | null;
        }
    >
> & { overhead: number; };
