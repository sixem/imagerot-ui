import type { TCurrentFile } from '@/data/types';

import { Hooks, Triggers } from '@/modules/';
import { MessageType } from '@/data/enums';
import { Config } from '@/config';

export const readFile = async (file: File | null = null): Promise<TCurrentFile | null> => {
    if (!file || !file.name || !file.type) return null;

    if (!Config.Filetypes.Allowed.includes(file.type)) {
        Hooks.trigger({
            trigger: Triggers.MESSAGE_RECEIVE,
            data: {
                type: MessageType.MSG_ERROR,
                message: `Type ${file.type} is not a valid format.`
            }
        }); return null;
    }

    Hooks.trigger({
        trigger: Triggers.MESSAGE_RECEIVE,
        data: {
            type: MessageType.MSG_OK,
            message: `Loaded ${file.name} ...`
        }
    });

    return { file, url: URL.createObjectURL(file) };
};