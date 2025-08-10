import type { TImageFile } from '@/data/types';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Image, Controls, Notifications, TooltipDisplay } from '@/components/';
import { Config } from '@/config';
import { MessageType } from '@/data/enums';
import { truncateString, debug } from '@/utils';
import { binder } from '@/binder';
import { hooks } from '@/modules/';

import './ImageRot.scss';

const log = debug('app:main');

const isFileDrag = (e: DragEvent) => {
    const dt = e.dataTransfer;

    if (!dt) return false;
    if (dt.types && Array.from(dt.types).includes('Files')) return true;
    if (dt.items && Array.from(dt.items).some(i => i.kind === 'file')) return true;

    return false;
};

const ImageRot = () => {
    const [isDropping, setDropping] = useState<boolean>(false);
    const [isBusy, setBusy] = useState<boolean>(false);

    // Store the loaded file as well as its edited version for restoration etc.
    const [currentFile, setFile] = useState<TImageFile | null>(null);
    const [currentEdit, setEdit] = useState<TImageFile | null>(null);

    // Set current file; clear edit on new base file
    const setAndRevokeFile = useCallback((image: TImageFile | null) => {
        setFile(image);
        setEdit(null);
    }, []);

    // Revoke previous file URL only when the file changes or unmounts
    useEffect(() => {
        const previous = currentFile?.url;
        return () => {
            if (previous) {
                URL.revokeObjectURL(previous);
                log("Revoked URL of base file", previous);
            }
        };
    }, [currentFile]);

    // Revoke previous edit URL only when the edit changes or unmounts
    useEffect(() => {
        const previous = currentEdit?.url;
        return () => {
            if (previous) {
                URL.revokeObjectURL(previous);
                log("Revoked URL of edited file", previous);
            }
        };
    }, [currentEdit]);

    const loadedId   = currentFile?.id ?? null;
    const loadedName = currentFile?.file?.name ?? null;

    useEffect(() => {
        if (loadedName) {
            log("Loaded file", currentFile);

            hooks.senders.notify(
                MessageType.ok,
                `Loaded ${truncateString(loadedName)} ...`
            );
        }
    }, [loadedId]);

    // Global drag/drop listeners with AbortController (clean teardown)
    useEffect(() => {
        binder.listen();

        const controller = new AbortController();
        const { signal } = controller;

        const onDragEnter = (e: DragEvent) => {
            if (isFileDrag(e)) {
                e.preventDefault();
                setDropping(true);
            }
        };

        const onDragOver = (e: DragEvent) => {
            if (isFileDrag(e)) {
                e.preventDefault();
            }
        };

        const onDragLeave = (e: DragEvent) => {
            if (isFileDrag(e)) {
                e.preventDefault();

                // Leaving the window entirely
                if (e.clientX === 0 && e.clientY === 0) {
                    setDropping(false);
                }
            }
        };

        const onDrop = async (e: DragEvent) => {
            if (!isFileDrag(e)) {
                return;
            }

            e.preventDefault();
            setDropping(false);

            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const validated = Config.filetypes.allowed.includes(file.type);

                if (validated) {
                    const id = self.crypto.randomUUID();

                    log("Drop file validated", file);

                    setAndRevokeFile({
                        file,
                        id,
                        url: URL.createObjectURL(file),
                        size: file.size,
                    });
                } else {
                    hooks.senders.notify(
                        MessageType.error,
                        `File was not loaded: Invalid file type (${file.type}) ...`
                    );
                }
            }
        };

        window.addEventListener('dragenter', onDragEnter, { signal, passive: false });
        window.addEventListener('dragover',  onDragOver,  { signal, passive: false });
        window.addEventListener('dragleave', onDragLeave, { signal, passive: false });
        window.addEventListener('drop',      onDrop,      { signal, passive: false });

        return () => {
            binder.unlisten();
            controller.abort(); // Auto-removes all listeners
        };
    }, [setAndRevokeFile]);

    // Stable props to avoid new identities each render
    const current = useMemo(() => ({ loaded: currentFile, edited: currentEdit }), [currentFile, currentEdit]);
    const setters = useMemo(() => ({ file: setAndRevokeFile, edit: setEdit }), [setAndRevokeFile]);
    const busy    = useMemo(() => ({ state: isBusy, update: setBusy }), [isBusy]);

    return (
        <div className="wrapper">
            <Image
                setters={setters}
                current={current}
                busy={busy}
            />

            <Controls
                setters={setters}
                current={current}
                busy={busy}
            />

            {isDropping ? <div className="dropping-overlay" /> : null}

            <Notifications />
            <TooltipDisplay />
        </div>
    );
};

export default ImageRot;
