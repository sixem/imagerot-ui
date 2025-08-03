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

export type TCurrentFile = {
    file: File | null;
    url: string;
};

export type TPaneSignature = {
    currentFile: TCurrentFile | null;
    setFile: React.Dispatch<React.SetStateAction<TCurrentFile>>;
};
