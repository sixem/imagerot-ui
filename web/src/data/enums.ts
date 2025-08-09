export const MessageType = {
    OK: 0, WARN: 1, ERROR: 2
};

export const WorkItemType = {
    mode: 0, effect: 1
} as const;

export const EffectType = {
    string: 'string',
    number: 'number',
    object: 'object',
    color: 'color'
} as const;