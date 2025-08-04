import type { TCurrentFile, TPaneSignature } from '@/data/types';

import { useRef, useState, useEffect } from 'react';
import { Hooks, Triggers } from '@/modules/';
import { readFile, readImgAsFile } from '@/utils';
import coverImage from '@/assets/cover.jpg';
import Drift from 'drift-zoom';

import './index.scss';

type TOptionsProps = {
    reset : () => void;
    open  : () => void;
    save  : () => void;
};

const HOOK_ID = {
    DOCUMENT_PASTE_WATCHER: 'document:paste:watcher',
};

const Cache: { currentFile: TCurrentFile | null } = { currentFile: null };

const Options = ({ reset, open, save }: TOptionsProps) => {
    return (
        <div className="options">
            <div onClick={reset} className="fileReset" title="Reset image" />
            <div onClick={open}  className="fileOpen"  title="Open in new tab" />
            <div onClick={save}  className="fileSave"  title="Save file" />
        </div>
    );
};

const Image = ({ currentFile, setFile }: TPaneSignature) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isZooming, setZooming] = useState<boolean>(false);
    
    let zoomInstance: Drift | null = null;

    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.style.opacity = '1';

            // Create a new zoom instance on the current image
            zoomInstance = new Drift(imgRef.current, {
                paneContainer: document.body.querySelector('#root') as HTMLDivElement,
                sourceAttribute: 'src',
                handleTouch: false
            });
        }

        Hooks.watch({
            trigger: Triggers.DOCUMENT_PASTE,
            identifier: HOOK_ID.DOCUMENT_PASTE_WATCHER,
            callback: async (file: DataTransferItem) => {
                const processed = await readFile(file.getAsFile());
                if (processed) setFile(processed);
            }
        });

        return () => { if (zoomInstance) zoomInstance.disable(); };
    });

    useEffect(() => {
        if (currentFile && imgRef.current) {
            imgRef.current.src = currentFile.url;
            Cache.currentFile = currentFile;
        }
    }, [currentFile]);

    const onImageLoad = async () => {
        // Read <img/> into a File on load if unset
        if (currentFile?.file === null && imgRef.current) {
            const file = await readImgAsFile(imgRef.current) || null;
            setFile(previous => ({...previous, ...{ file }}))
        }
    };

    return (
        <div className={"image" + (isZooming ? " zooming" : "")} onMouseDown={(e) => {
            if (!(e.target as HTMLElement).classList.contains('image')) return;
            setZooming(true);

            if (imgRef.current) { // Assures we zoom in straight away on mouse down
                imgRef.current.dispatchEvent(new MouseEvent('mouseenter', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                }));
            }
        }} onMouseUp={() => {
            setZooming(false);

            if (imgRef.current) { // Trigger zoom exit on mouse up
                imgRef.current.dispatchEvent(new MouseEvent('mouseleave'));
            }
        }} >
            <img id="output" ref={imgRef} src={coverImage} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} onLoad={onImageLoad}/>

            <Options {...{
                reset: () => {
                    if (Cache.currentFile) {
                        setFile(Cache.currentFile);
                    }
                },
                open: () => {
                    if (Cache.currentFile) {
                        window.open(Cache.currentFile.url, '_blank');
                    }
                },
                save: () => console.debug('save'),
            }}/>
        </div>
    );
};

export { Image };
