import { WorkItemType } from './enums';

export type TEffects = {
    [key: string]: TEffectItem;
};

export type TEffectConfigNumber = ['number', number, number, number, (n: number) => number, (string | null)?, string?];
export type TEffectConfigString = ['string', string[], string?];
export type TEffectConfigColor  = ['color', [number, number, number], string?];
export type TEffectConfigObject = ['object', { [key: string]: TEffectConfigItem }];

export type TEffectConfigItem =
    TEffectConfigNumber |
    TEffectConfigString |
    TEffectConfigColor  |
    TEffectConfigObject;

export type TEffectItem = {
    description?: string,
    format?: string,
    config: {
        [key: string]: TEffectConfigItem;
    } | null
};

export type TEffectValue = number | string | [number, number, number];

export type TModeItem = {
    format: string;
    description: string;
};

export type TModes = {
    [key: string]: TModeItem
};

export type TImageFile = {
    file: File | null;
    url: string;
    size: number | null;
    dimensions?: [number, number];
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
    }
};

export type TEffectChangeEvent = {
    config: { [key: string]: TEffectConfigItem };
    onChange: (name: string, value: TEffectValue) => void;
};

export type TInputSignature<TItem = TEffectConfigNumber> = {
    name: string;
    item: TItem;
    onChange: TEffectChangeEvent['onChange']
};

export type TWorkItem = {
    key: string;
    type: typeof WorkItemType[keyof typeof WorkItemType];
    config: null | { [key: string]: TEffectValue; };
    id: number;
    muted?: boolean;
};

/** Background worker input and output */

export interface TProcessorInput {
    image: TImageFile;
    workflow: TWorkItem[];
};

export interface TProcessorOutput {
    image: TImageFile;
};

export type TNotifyItem = {
    type: number;
    message: string;
    id: number;
    visible: boolean;
    duration?: number;
};