import type { TPaneSignature } from '@/data/types';

import { useEffect, useRef, useState } from 'react';
import { hooks, triggers } from '@/modules/';
import { InputFile } from '@/components/controls/input';
import { debug, pinEditedImage, readFile, stripExtension } from '@/utils';

import iconUrl from '@/assets/icon.png';
import Drift from 'drift-zoom';
import { Options } from './options';
import { SaveModal, type TSaveSettings } from './save-modal';
import { Spinner } from './spinner';
import { TipHints } from './tip-hints';
import './index.scss';

const hookId = {
    documentPasteWatcher: 'document:paste:watcher',
    exportImageWatcher: 'image:export:watcher'
};
const log = debug('app:components:image');

const Image = ({ current, setters, busy }: TPaneSignature) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const zoomRef = useRef<Drift>(null);
    const settersRef = useRef(setters);
    const [isZooming, setZooming] = useState<boolean>(false);
    const [isSaveOpen, setSaveOpen] = useState(false);
    const [saveSettings, setSaveSettings] = useState<TSaveSettings>({
        format: 'png',
        quality: 0.9
    });
    const showLander = current?.loaded === null;

    useEffect(() => { settersRef.current = setters }, [setters]);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (imgRef.current) {
                imgRef.current.style.opacity = '1';
            }
        });
    }, [current?.loaded]);

    useEffect(() => {
        if (!imgRef.current) return;

        zoomRef.current = new Drift(imgRef.current, {
            paneContainer: document.body.querySelector('#root > div.wrapper') as HTMLDivElement,
            sourceAttribute: 'src',
            handleTouch: false
        });

        return () => zoomRef.current?.destroy();
    }, [isZooming]);

    useEffect(() => {
        hooks.watch({
            trigger: triggers.documentPaste,
            identifier: hookId.documentPasteWatcher,
            callback: (file: DataTransferItem) => {
                readFile(file.getAsFile()).then((processed) => {
                    if (processed) {
                        settersRef.current.file(processed);
                    }
                }).catch((error) => log(error));
            }
        });

        return () => {
            hooks.unwatch({
                trigger: triggers.documentPaste,
                identifier: hookId.documentPasteWatcher
            });
        };
    }, []);

    useEffect(() => {
        hooks.watch({
            trigger: triggers.exportImage,
            identifier: hookId.exportImageWatcher,
            callback: () => setSaveOpen(true)
        });

        return () => {
            hooks.unwatch({
                trigger: triggers.exportImage,
                identifier: hookId.exportImageWatcher
            });
        };
    }, []);

    useEffect(() => {
        if (current.loaded && imgRef.current) {
            imgRef.current.src = current.loaded.url;
        }
    }, [current.loaded]);

    const currentUrl = current.edited?.url
        ? current.edited.url
        : current.loaded?.url || undefined;

    const sourceName = current.edited?.file?.name
        || current.loaded?.file?.name
        || 'image';
    const baseName = stripExtension(sourceName);

    return (
        <div className={"image" + (isZooming ? " zooming" : "")} onMouseDown={(event) => {
            if (event.button === 2 || (event.button === 0 && event.ctrlKey) || isZooming) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            setZooming(true);
        }} onMouseUp={() => setZooming(false)} >
            {showLander ? (
                <div className="lander" style={{ margin: '10px' }}>
                    <div className="img">
                        <img src={iconUrl} />
                    </div>
                    <InputFile setter={setters.file} text={
                        "To get started, click here to select an image or drop an image anywhere."
                    } />
                    <TipHints />
                    <div className="version">
                        <span>Version: {__APP_VERSION__}</span>
                    </div>
                </div>
            ) : <img id="output" ref={imgRef} src={currentUrl} draggable={false} style={{
                pointerEvents: isZooming ? 'auto' : 'none'
            }} />}

            <Spinner visible={busy.state} />

            <Options {...{
                trash: current.loaded ? () => { setters.edit(null); setters.file(null); } : null,
                reset: current.edited ? () => { setters.edit(null); } : null,
                pin: current.edited ? () => { void pinEditedImage(current, setters); } : null,
                save: current.edited || current.loaded ? () => { setSaveOpen(true); } : null,
                open: currentUrl ? () => { window.open(currentUrl, '_blank'); } : null
            }} />

            <SaveModal
                visible={isSaveOpen}
                sourceUrl={currentUrl || null}
                baseName={baseName}
                settings={saveSettings}
                setSettings={setSaveSettings}
                onClose={() => setSaveOpen(false)}
            />
        </div>
    );
};

export { Image };
