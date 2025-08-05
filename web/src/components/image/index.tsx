import type { TPaneSignature } from '@/data/types';

import { useRef, useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Hooks, Triggers } from '@/modules/';
import { readFile } from '@/utils';
import Drift from 'drift-zoom';

import './index.scss';

type TOptionsProps = {
    reset : null | (() => void);
    open  : null | (() => void);
    save  : null | (() => void);
};

const hookId = {
    DOCUMENT_PASTE_WATCHER: 'document:paste:watcher',
};

const Options = ({ reset, open, save }: TOptionsProps) => {
    return (
        <div className="options">
            {reset ? <div onClick={reset} className="fileReset" title="Reset image" /> : null}
            {open  ? <div onClick={open}  className="fileOpen"  title="Open in new tab" /> : null}
            {save  ? <div onClick={save}  className="fileSave"  title="Save file" /> : null}
        </div>
    );
};

const Image = ({ current, setters }: TPaneSignature) => {
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
            identifier: hookId.DOCUMENT_PASTE_WATCHER,
            callback: async (file: DataTransferItem) => {
                const processed = await readFile(file.getAsFile());
                if (processed) setters.file(processed);
            }
        });

        return () => { if (zoomInstance) zoomInstance.disable(); };
    });

    useEffect(() => {
        if (current.loaded && imgRef.current) {
            imgRef.current.src = current.loaded.url;
        }
    }, [current.loaded]);

    // Retrieve the current image URL (prioritize showing the edited image)
    const currentUrl = current.edited?.url ? current.edited.url : (current.loaded?.url || undefined);

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
            <img id="output" ref={imgRef} src={currentUrl} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} />

            <Options {...{
                reset: current?.loaded ? () => {
                    setters.edit(null);
                } : null,
                open: currentUrl ? () => {
                    window.open(currentUrl, '_blank')
                } : null,
                save: (current.edited || current.loaded) ? () => {
                    const target = (current.edited || current.loaded);

                    if (target) {
                        saveAs(target.url, self.crypto.randomUUID() + '.png' || 'image.png');
                    }
                } : null,
            }}/>
        </div>
    );
};

export { Image };
