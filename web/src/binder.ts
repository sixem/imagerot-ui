import { hooks, triggers } from '@/modules/';

const hookId = { DocumentPasteListener: 'document:paste:listener' };

const listen = () => {
    hooks.listen({
        pointer: document,
        events: 'paste',
        identifier: hookId.DocumentPasteListener,
        callbacks: (event: ClipboardEvent) => {
            const items = event.clipboardData?.items || [];

            for (const item of items) {
                if (item.kind === 'file') {
                    hooks.trigger({ trigger: triggers.documentPaste, data: item });
                    break;
                }
            }
        }
    });
};

const unlisten = () => {
    hooks.unlisten({
        pointer: document,
        events: 'paste',
        identifier: hookId.DocumentPasteListener
    });
};

export const binder = { listen, unlisten };
