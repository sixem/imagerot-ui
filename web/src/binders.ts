import { Hooks, Triggers } from '@/modules/';

const hookId = {
    DOCUMENT_PASTE_LISTENER: 'document:paste:listener',
};

const listen = () => {
    Hooks.listen({
        pointer: document,
        events: 'paste',
        identifier: hookId.DOCUMENT_PASTE_LISTENER,
        callbacks: (event: ClipboardEvent) => {
            const items = event.clipboardData?.items || [];

            for (const item of items) {
                if (item.kind === 'file') {
                    Hooks.trigger({ trigger: Triggers.DOCUMENT_PASTE, data: item });
                    break;
                }
            }
        }
    });
};

const unlisten = () => {
    Hooks.unlisten({
        pointer: document,
        events: 'paste',
        identifier: hookId.DOCUMENT_PASTE_LISTENER
    });
};

export const binders = { listen, unlisten };
