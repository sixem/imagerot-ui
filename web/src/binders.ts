import { Hooks, Triggers } from '@/modules/';

const HOOK_ID = {
    DOCUMENT_PASTE_LISTENER: 'document:paste:listener',
};

const listen = () => {
    Hooks.listen({
        pointer: document,
        events: 'paste',
        identifier: HOOK_ID.DOCUMENT_PASTE_LISTENER,
        callbacks: (event: ClipboardEvent) => {
            const items = event.clipboardData?.items || [];

            for (const item of items) {
                if (item.kind === 'file') {
                    Hooks.trigger({
                        trigger: Triggers.DOCUMENT_PASTE,
                        data: item
                    }); break;
                }
            }
        }
    });

    Hooks.listen({
        pointer: document.body.querySelector('#root') as HTMLElement,
        events: 'drop',
        identifier: "TEST",
        callbacks: (event: any) => console.log(event)
    });
};

const unlisten = () => {
    Hooks.unlisten({
        pointer: document,
        events: 'paste',
        identifier: HOOK_ID.DOCUMENT_PASTE_LISTENER
    });
};

export const binders = { listen, unlisten };
