import { useRef, useState, useEffect } from 'react';
import { Hooks, Triggers } from '@/modules/';
import { readFile } from '@/utils';
import coverImage from '@/assets/cover.jpg';
import Drift from 'drift-zoom';

import './index.scss';

type TOptionsProps = {
    reset : () => void;
    open  : () => void;
    save  : () => void;
};

type TCurrentFile = { file: File, url: string };

const HOOK_ID = {
    DOCUMENT_PASTE_WATCHER: 'document:paste:watcher',
};

const Cache: { currentFile: TCurrentFile | null | null } = { currentFile: null };

const Options = ({ reset, open, save }: TOptionsProps) => {
    return (
        <div className="options">
            <div onClick={reset} className="fileReset" title="Reset image"></div>
            <div onClick={open}  className="fileOpen"  title="Open in new tab"></div>
            <div onClick={save}  className="fileSave"  title="Save file"></div>
        </div>
    );
};

const Image = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [currentFile, setFile] = useState<TCurrentFile | null>(null);
    const [isZooming, setZooming] = useState<boolean>(false);
    
    let zoomInstance: Drift | null = null;

    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.style.opacity = '1';

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

                if (processed) {
                    setFile({ file: processed.file, url: processed.blob });
                }
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

    return (
        <div className={"image" + (isZooming ? " zoom" : "")} onMouseDown={(e) => {
            setZooming(true);

            if (imgRef.current) {
                imgRef.current.dispatchEvent(new MouseEvent('mouseenter', {
                    bubbles: true,
                    cancelable: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                }));
            }
        }} onMouseUp={() => {
            setZooming(false);

            if (imgRef.current) {
                imgRef.current.dispatchEvent(new MouseEvent('mouseleave'));
            }
        }} >
            <img id="output" ref={imgRef} src={coverImage} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} />
            <Options {...{
                reset : () => {
                    if (Cache.currentFile) {
                        setFile(Cache.currentFile);
                    }
                },
                open  : () => console.debug('open'),
                save  : () => console.debug('save'),
            }}/>
        </div>
    );
};

export { Image };
