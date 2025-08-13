import { debug, uid, isTauri } from '@/utils';

const log = debug('app:utils:save-as-adaptive');

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

type TSaveAsAdaptive = (target: Blob | string, basename?: string | null) => Promise<boolean>;

export const saveAsAdaptive: TSaveAsAdaptive = async (target, basename = null) => {
    const blob = await urlToBlob(target);

    if (!Object.hasOwn(mimeToExtensions, blob.type)) {
        return false;
    }
    
    const filename = (basename ? (basename + '-') : "") + uid();

    if (isTauri()) {
        // Tauri context
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        const { save } = await import('@tauri-apps/plugin-dialog');

        // Open native save dialog with optional filters
        const filePath = await save({
            defaultPath: filename,
            filters: getMimeFilters([blob.type])
        });

        if (filePath) {
            // Convert blob to Uint8Array and write to the chosen path
            const arrayBuffer = await blob.arrayBuffer();
            await writeFile(filePath, new Uint8Array(arrayBuffer));
            log("Attempted save", { tauriContext: true, filePath, filename });
            return true;
        }
    } else {
        // Browser context
        const { default: saveAs } = await import('file-saver');
        saveAs(blob, filename);
        log("Attempted save", { tauriContext: false, filename });
        return true;
    }

    return false;
};