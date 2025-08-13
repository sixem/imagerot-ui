import type { TBucketKeys } from '@/data/types';

export const MessageType = {
    ok: 0,
    warn: 1,
    error: 2
} as const;

export const WorkItemType = {
    mode: 0,
    effect: 1
} as const;

export const EffectType = {
    string: 'string',
    number: 'number',
    object: 'object',
    color: 'color'
} as const;

export const StorageKeys = {
    uiReversed: 'uiReversed',
} as const;

export const BucketKeys = ['modes', 'effects'] as const satisfies readonly TBucketKeys[];