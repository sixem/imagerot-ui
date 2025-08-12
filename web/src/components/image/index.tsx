import type { TPaneSignature } from '@/data/types';

import { useRef, useState, useEffect } from 'react';
import { hooks, triggers } from '@/modules/';
import { Tooltip } from '@/components/tooltips/';
import { InputFile } from '@/components/controls/input';
import { readFile, saveAsAdaptive } from '@/utils';

import iconUrl from '@/assets/icon.png';
import Drift from 'drift-zoom';
import './index.scss';

type TOptionFun = (() => void) | null;

type TOptionsProps = Record<
    'pin' | 'reset' | 'trash' | 'open' | 'save',
    TOptionFun
>;

type TOptionSignature = (
    current: TPaneSignature["current"],
    setters: TPaneSignature["setters"]
) => void;

const hookId = {
    DocumentPasteWatcher: 'document:paste:watcher'
};

/**
 * General option buttons
 */
const Options = ({ pin, reset, open, save, trash }: TOptionsProps) => {
    const [isToggled, setToggled] = useState<boolean>(true);

    return (
        <div className="options">
            {isToggled && pin ? (
                <Tooltip text="Pin the current canvas as the unmodified image">
                    <div onClick={pin} className="file-pin" />
                </Tooltip>
            ) : null}

            {isToggled && reset ? (
                <Tooltip text="Reset the image back to its unmodified state">
                    <div onClick={reset} className="file-reset" />
                </Tooltip>
            ) : null}

            {isToggled && trash ? (
                <Tooltip text="Clear the entire canvas">
                    <div onClick={trash} className="file-trash" />
                </Tooltip>
            ) : null}

            {isToggled && open ? (
                <Tooltip text="Open the image in a new tab or window">
                    <div onClick={open} className="file-open"  />
                </Tooltip>
            ) : null}

            {isToggled && save ? (
                <Tooltip text="Save the current canvas locally">
                    <div onClick={save} className="file-save" />
                </Tooltip>
            ) : null}

            {(pin || reset || open || save || trash) ? (
                <Tooltip text={"Toggle the collapsed state of the toolbar"}>
                    <div onClick={() => setToggled((p) => !p)} className={
                        "file-toggle" + (isToggled ? " expanded" : "")
                    } />
                </Tooltip>
            ) : null}
        </div>
    );
};

/**
 * Simple loading indicator
 */
const Spinner = ({ visible }: { visible: boolean; }) => {
    return (
        <div className={"spinner" + (visible ? " visible" : "")}>
            <div className="icon" />
        </div>
    );
};

const onImagePin: TOptionSignature = async (current, setters) => {
    if (current.edited) {
        // Fetch blob data, create a new file, and update the blob URL
        const blob = await fetch(current.edited.url).then((res) => res.blob());
        const file = new File([blob], current.edited?.file?.name || 'image.png', { type: blob.type });
        const url  = URL.createObjectURL(file);

        // Update current and clear edited canvas
        setters.file({ ...current.edited, file, url });
        setters.edit(null);
    }
};

const onImageSave: (current: TPaneSignature["current"]) => void = async (current) => {
    if (current.edited || current.loaded) {
        const target = (current.edited || current.loaded);

        if (target) {
            const filename = self.crypto.randomUUID() + '.png' || 'image.png';
            saveAsAdaptive(target.url, filename, {
                mimes: ['image/png']
            });
        }
    }
};

const Image = ({ current, setters, busy }: TPaneSignature) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isZooming, setZooming] = useState<boolean>(false);
    
    useEffect(() => {
        let zoomInstance: Drift | null = null;

        if (imgRef.current) {
            imgRef.current.style.opacity = '1';

            // Create a new zoom instance on the current image
            zoomInstance = new Drift(imgRef.current, {
                paneContainer: document.body.querySelector('#root > div.wrapper') as HTMLDivElement,
                sourceAttribute: 'src',
                handleTouch: false
            });
        }

        hooks.watch({
            trigger: triggers.documentPaste,
            identifier: hookId.DocumentPasteWatcher,
            callback: (file: DataTransferItem) => {
                readFile(file.getAsFile()).then((processed) => {
                    if (processed) {
                        setters.file(processed);
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        });

        return () => {
            if (zoomInstance) {
                zoomInstance.disable();
            }
        };
    });

    useEffect(() => {
        if (current.loaded && imgRef.current) {
            imgRef.current.src = current.loaded.url;
        }
    }, [current.loaded]);

    // Retrieve the current image URL (prioritize showing the edited image)
    const currentUrl = current.edited?.url
        ? current.edited.url
        : current.loaded?.url || undefined;

    return (
        <div className={"image" + (isZooming ? " zooming" : "")} onMouseDown={(e) => {
            if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (!imgRef.current || !(e.target as HTMLElement).classList.contains('image')) return;

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
                    <div className="img">
                        <img src={iconUrl} />
                    </div>
                    <InputFile setter={setters.file} text={
                        "To get started, click here to select an image or drop an image anywhere."
                    } />
                    <div className="version">
                        <span>Version: {__APP_VERSION__}</span>
                    </div>
                </div>
            ) : <img id="output" ref={imgRef} src={currentUrl} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} />}

            <Spinner visible={busy.state} />

            <Options {...{
                trash : current.loaded ? () => { setters.edit(null); setters.file(null); } : null,
                reset : current.edited ? () => { setters.edit(null); } : null,
                pin   : current.edited ? () => onImagePin(current, setters) : null,
                save  : current.edited || current.loaded ? () => { onImageSave(current); } : null,
                open  : currentUrl ? () => { window.open(currentUrl, '_blank'); } : null
            }}/>
        </div>
    );
};

export { Image };
