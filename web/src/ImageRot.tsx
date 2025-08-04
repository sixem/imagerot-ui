import type { TCurrentFile } from '@/data/types';

import { useEffect, useState, useRef } from 'react';
import { Image, Controls } from './components/';
import { binders } from './binders';
import { Config } from '@/config';
import { MessageType } from '@/data/enums';
import { Hooks, Triggers } from '@/modules/';
import coverImage from '@/assets/cover.jpg';

import './ImageRot.scss';

const ImageRot = () => {
    const [isDropping, setDropping] = useState<boolean>(false);
    const [currentFile, setFile] = useState<TCurrentFile>({ file: null, url: coverImage });

    const dragEnterHandler = useRef<(e: DragEvent) => void>(null);
    const dragOverHandler  = useRef<(e: DragEvent) => void>(null);
    const dragLeaveHandler = useRef<(e: DragEvent) => void>(null);
    const dropHandler      = useRef<(e: DragEvent) => void>(null);

    useEffect(() => {
        binders.listen(); // Set up listeners and hooks

        // Define drag handlers

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

                if (Config.Filetypes.Allowed.includes(file.type)) {
                    setFile({ file, url: URL.createObjectURL(file) });
                } else {
                    Hooks.trigger({
                        trigger: Triggers.MESSAGE,
                        data: {
                            type: MessageType.MSG_WARN,
                            message: `File was not loaded: Invalid file type (${file.type}) ...`
                        }
                    });
                }
            }
        };

        // Attach drag handlers to window
        window.addEventListener('dragenter', dragEnterHandler.current);
        window.addEventListener('dragover', dragOverHandler.current);
        window.addEventListener('dragleave', dragLeaveHandler.current);
        window.addEventListener('drop', dropHandler.current);

        return () => {
            binders.unlisten();

            if (dragEnterHandler.current) window.removeEventListener('dragenter', dragEnterHandler.current);
            if (dragOverHandler.current)  window.removeEventListener('dragover', dragOverHandler.current);
            if (dragLeaveHandler.current) window.removeEventListener('dragleave', dragLeaveHandler.current);
            if (dropHandler.current)      window.removeEventListener('drop', dropHandler.current);
        };
    }, []);

    return (
        <div className="wrapper">
            <Image
                setFile={setFile}
                currentFile={currentFile}
            />

            <Controls
                setFile={setFile}
                currentFile={currentFile}
            />

            {isDropping ? <div className="dropping-overlay" /> : null}
        </div>
    );
};

export default ImageRot;
