import { Hooks, Triggers } from '@/modules/';
import { MessageType } from '@/data/enums';
import { Config } from '@/config';

export const readFile = async (file: File | null = null) => {
    if (!file || !file.name || !file.type) return;

    if (!Config.ALLOWED_FILETYPES.includes(file.type)) {
        Hooks.trigger({
            trigger: Triggers.MESSAGE_RECEIVE,
            data: {
                type: MessageType.MSG_ERROR,
                message: `Type ${file.type} is not a valid format.`
            }
        }); return;
    }

    Hooks.trigger({
        trigger: Triggers.MESSAGE_RECEIVE,
        data: {
            type: MessageType.MSG_OK,
            message: `Loaded ${file.name} ...`
        }
    });

    return { file, blob: URL.createObjectURL(file) };
};