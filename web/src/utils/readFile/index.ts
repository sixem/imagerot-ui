import type { TImageFile } from '@/data/types';

import { hooks } from '@/modules/';
import { MessageType } from '@/data/enums';
import { config } from '@/config';

export const readFile = async (file: File | null = null): Promise<TImageFile | null> => {
    if (!file || !file.name || !file.type) return null;

    if (!config.filetypes.allowed.includes(file.type)) {
        hooks.senders.notify(MessageType.error,`Type ${file.type} is not a valid format.`);
        return null;
    }

    const id = self.crypto.randomUUID();
    const size = file.size;

    return { file, id, size, url: URL.createObjectURL(file) };
};