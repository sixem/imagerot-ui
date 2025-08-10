import { MessageType } from '@/data/enums';
import { hooks } from './index';
import { triggers } from './triggers';

type MessageTypeValue = typeof MessageType[keyof typeof MessageType];

const notify = (type: MessageTypeValue, message: string) => {
    hooks.trigger({ trigger: triggers.notify, data: { type, message } });
};

export const senders = {
    notify
};
