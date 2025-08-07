import type { TPaneSignature } from '@/data/types';

import { useRef, useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Hooks, Triggers } from '@/modules/';
import { Tooltip } from '@/components/tooltips/';
import { InputFile } from '@/components/controls/input';
import { readFile } from '@/utils';

import Drift from 'drift-zoom';
import './index.scss';

type TOptionsProps = {
    reset : null | (() => void);
    trash : null | (() => void);
    open  : null | (() => void);
    save  : null | (() => void);
};

const hookId = {
    DOCUMENT_PASTE_WATCHER: 'document:paste:watcher',
};

const Options = ({ reset, open, save, trash }: TOptionsProps) => {
    return (
        <div className="options">
            {trash ? (
                <Tooltip text="Clear the entire canvas">
                    <div onClick={trash} className="file-trash" />
                </Tooltip>
            ) : null}
            {open ? (
                <Tooltip text="Open the image in a new tab or window">
                    <div onClick={open} className="file-open"  />
                </Tooltip>
            ) : null}
            {reset ? (
                <Tooltip text="Reset the image back to its unmodified state">
                    <div onClick={reset} className="file-reset" />
                </Tooltip>
            ) : null}
            {save ? (
                <Tooltip text="Save the image to the computer">
                    <div onClick={save} className="file-save" />
                </Tooltip>
            ) : null}
        </div>
    );
};

const Spinner = ({ visible }: { visible: boolean; }) => {
    return (
        <div className={"spinner" + (visible ? " visible" : "")}>
            <div className="icon" />
        </div>
    );
}

const Image = ({ current, setters, busy }: TPaneSignature) => {
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
            {current?.loaded === null ? (
                <div className="lander" style={{ margin: '10px' }}>
                    <InputFile setter={setters.file} text={
                        "To get started, click here to select an image, or drop a file anywhere."
                    } />
                </div>
            ) : <img id="output" ref={imgRef} src={currentUrl} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} />}

            <Spinner visible={busy.state} />

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
                trash: current.loaded ? () => {
                    setters.edit(null);
                    setters.file(null);
                } : null
            }}/>
        </div>
    );
};

export { Image };
