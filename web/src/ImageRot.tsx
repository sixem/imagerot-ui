import type { TImageFile } from '@/data/types';

import { useEffect, useState, useRef } from 'react';
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

    // References to drag handlers (for handling of drag and drop)
    const dragEnterHandler = useRef<(e: DragEvent) => void>(null);
    const dragOverHandler  = useRef<(e: DragEvent) => void>(null);
    const dragLeaveHandler = useRef<(e: DragEvent) => void>(null);
    const dropHandler      = useRef<(e: DragEvent) => void>(null);

    // Set current file (base file) and revoke any blobs
    const setAndRevokeFile = (image: TImageFile | null) => {
        setFile(previous => {
            if (previous?.url) {
                URL.revokeObjectURL(previous.url);
            } return image;
        });

        // Clear and invalidate edit file (result/modified file) on new file load
        setEdit(previous => {
            if (previous?.url) {
                URL.revokeObjectURL(previous.url);
            } return null;
        })
    };

    // Set current edit and revoke any blobs
    const setAndRevokeEdit = (image: TImageFile | null) => {
        setEdit(previous => {
            if (previous?.url) {
                URL.revokeObjectURL(previous.url);
            } return image;
        });
    };

    // Notify on file changes
    useEffect(() => {
        if (currentFile?.file) {
            Hooks.senders.notify(MessageType.OK, `Loaded: ${truncateString(currentFile.file.name)}`);
        }
    }, [currentFile]);

    useEffect(() => {
        // Set up listeners and hooks

        binders.listen();

        dragEnterHandler.current = (e: DragEvent) => {
            e.preventDefault();
            setDropping(true);
        };

        dragOverHandler.current = (e: DragEvent) => {
            e.preventDefault();
        };

        dragLeaveHandler.current = (e: DragEvent) => {
            e.preventDefault();

            if (e.clientX === 0 && e.clientY === 0) {
                setDropping(false);
            }
        };

        dropHandler.current = (e: DragEvent) => {
            e.preventDefault();
            setDropping(false);

            if (e.dataTransfer && e.dataTransfer?.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const validated = Config.filetypes.allowed.includes(file.type);

                if (validated) {
                    setAndRevokeFile({ file, url: URL.createObjectURL(file), size: file.size });
                } else {
                    Hooks.senders.notify(
                        MessageType.ERROR,
                        `File was not loaded: Invalid file type (${file.type}) ...`
                    );
                }
            }
        };

        // Attach drag handlers to window
        window.addEventListener('dragenter', dragEnterHandler.current);
        window.addEventListener('dragover', dragOverHandler.current);
        window.addEventListener('dragleave', dragLeaveHandler.current);
        window.addEventListener('drop', dropHandler.current);

        // Clean up listeners on unmount
        return () => {
            binders.unlisten();

            if (dragEnterHandler.current) window.removeEventListener('dragenter', dragEnterHandler.current);
            if (dragOverHandler.current)  window.removeEventListener('dragover',  dragOverHandler.current);
            if (dragLeaveHandler.current) window.removeEventListener('dragleave', dragLeaveHandler.current);
            if (dropHandler.current)      window.removeEventListener('drop',      dropHandler.current);
        };
    }, []);

    return (
        <div className="wrapper">
            <Image
                setters={{ file: setAndRevokeFile, edit: setAndRevokeEdit }}
                current={{ loaded: currentFile, edited: currentEdit }}
                busy={{ state: isBusy, update: (state: boolean) => setBusy(state)}}
            />

            <Controls
                setters={{ file: setAndRevokeFile, edit: setAndRevokeEdit }}
                current={{ loaded: currentFile, edited: currentEdit }}
                busy={{ state: isBusy, update: (state: boolean) => setBusy(state)}}
            />

            {isDropping ? <div className="dropping-overlay" /> : null}

            <Notifications />
            <TooltipDisplay />
        </div>
    );
};

export default ImageRot;
