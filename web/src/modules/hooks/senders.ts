import { MessageType } from '@/data/enums';
import { Hooks } from './index';
import { Triggers } from './triggers';

type MessageTypeValue = typeof MessageType[keyof typeof MessageType];

const notify = (type: MessageTypeValue, message: string) => {
    Hooks.trigger({ trigger: Triggers.NOTIFY, data: { type, message } });
};

export const senders = {
    notify
};
