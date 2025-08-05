import type { TImageFile } from '@/data/types';

import { Hooks } from '@/modules/';
import { MessageType } from '@/data/enums';
import { Config } from '@/config';

export const readFile = async (file: File | null = null): Promise<TImageFile | null> => {
    if (!file || !file.name || !file.type) return null;

    if (!Config.filetypes.allowed.includes(file.type)) {
        Hooks.senders.notify(
            MessageType.ERROR,
            `Type ${file.type} is not a valid format.`
        ); return null;
    }

    Hooks.senders.notify(MessageType.OK,`Loaded ${file.name} ...`);

    return { file, url: URL.createObjectURL(file) };
};