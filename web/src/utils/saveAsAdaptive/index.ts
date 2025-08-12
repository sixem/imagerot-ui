import { debug } from '@/utils';

const log = debug('app:utils:save-as-adaptive');

/** Simple MIME-to-extensions map */
const mimeToExtensions: Record<string, string[]> = {
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/json': ['json'],
};

const getMimeFilters = (mimes?: string[]) => {
    if (!mimes || mimes.length === 0) return undefined;

    const extensions = mimes.flatMap(mime => mimeToExtensions[mime] || []);
    if (extensions.length === 0) return undefined;

    return [{ name: 'Supported Files', extensions }];
};

const urlToBlob = async (url: Blob | string) => {
    if (typeof url === 'string') {
        const response = await fetch(url);
        return await response.blob();
    }

    return url;
};

type TSaveAsOptions = {
    mimes:string[]
};

type TSaveAsAdaptive = (target: Blob | string, filename: string, options: TSaveAsOptions) => Promise<void>;

export const saveAsAdaptive: TSaveAsAdaptive = async (target, filename, options) => {
    const isTauri = '__TAURI_INTERNALS__' in window;
    const blob = await urlToBlob(target);

    if (isTauri) {
        // Tauri context
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeFile } = await import('@tauri-apps/plugin-fs');

        // Open native save dialog with optional filters
        const filters = getMimeFilters(options.mimes);

        const filePath = await save({
            defaultPath: filename,
            filters,
        });

        if (filePath) {
            // Convert blob to Uint8Array and write to the chosen path
            const arrayBuffer = await blob.arrayBuffer();
            await writeFile(filePath, new Uint8Array(arrayBuffer));

            log("Attempted save", { tauriContext: isTauri, filePath, filename, options });
        }
    } else {
        // Browser context
        const { default: saveAs } = await import('file-saver');
        saveAs(blob, filename);
        log("Attempted save", { tauriContext: isTauri, filename, options });
    }
};