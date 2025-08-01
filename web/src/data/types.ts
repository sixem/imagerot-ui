export type TEffects = {
    [key: string]: TEffectItem;
};

export type TEffectConfigNumber = ['number', number, number, number, (n: number) => n, null, string | null];
export type TEffectConfigString = ['string', string[]];
export type TEffectConfigColor  = ['color', [number, number, number]];

export type TEffectConfigItem =
    TEffectConfigNumber |
    TEffectConfigString |
    TEffectConfigColor;

export type TEffectItem = {
    description?: string,
    format?: string,
    config: {
        [key: string]: TEffectConfigItem;
    }
};
