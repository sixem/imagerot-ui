import type { TImageFile } from '@/data/types';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Image, Controls, Notifications, TooltipDisplay } from '@/components/';
import { binders } from '@/binders';
import { Config } from '@/config';
import { MessageType } from '@/data/enums';
import { truncateString } from '@/utils';
import { Hooks } from '@/modules/';

import './ImageRot.scss';

const ImageRot = () => {
    const [isDropping, setDropping] = useState<boolean>(false);
    const [isBusy, setBusy] = useState<boolean>(false);

    // Store the loaded file as well as its edited version for restoration etc.
    const [currentFile, setFile] = useState<TImageFile | null>(null); // Base file
    const [currentEdit, setEdit] = useState<TImageFile | null>(null); // Modified file

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
            }
        };
    }, [currentFile]);

    // Revoke previous edit URL only when the edit changes or unmounts
    useEffect(() => {
        const previous = currentEdit?.url;
        return () => {
            if (previous) {
                URL.revokeObjectURL(previous);
            }
        };
    }, [currentEdit]);

    const loadedId   = currentFile?.id ?? null;
    const loadedName = currentFile?.file?.name ?? null;

    useEffect(() => {
        if (loadedName) {
            Hooks.senders.notify(
                MessageType.OK,
                `Loaded ${truncateString(loadedName)} ...`
            );
        }
    }, [loadedId]);

    // Global drag/drop listeners with AbortController (clean teardown)
    useEffect(() => {
        binders.listen();

        const ac = new AbortController();
        const { signal } = ac;

        const onDragEnter = (e: DragEvent) => {
            e.preventDefault();
            setDropping(true);
        };

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const onDragLeave = (e: DragEvent) => {
            e.preventDefault();
            if (e.clientX === 0 && e.clientY === 0) setDropping(false); // Leaving the window entirely
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            setDropping(false);

            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const validated = Config.filetypes.allowed.includes(file.type);

                if (validated) {
                    const id = self.crypto.randomUUID();
                    setAndRevokeFile({
                        file,
                        id,
                        url: URL.createObjectURL(file),
                        size: file.size,
                    });
                } else {
                    Hooks.senders.notify(
                        MessageType.ERROR,
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
            binders.unlisten();
            ac.abort(); // Auto-removes all listeners
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
