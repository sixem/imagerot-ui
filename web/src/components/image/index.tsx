import type { TPaneSignature } from '@/data/types';

import type { Dispatch, SetStateAction } from 'react';

import { useRef, useState, useEffect } from 'react';
import { hooks, triggers } from '@/modules/';
import { Tooltip } from '@/components/tooltips/';
import { InputFile } from '@/components/controls/input';
import { readFile, saveAsAdaptive, debug, formatBytes, stripExtension, loadImage } from '@/utils';
import { ButtonSet } from '@/components/button';

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
    documentPasteWatcher: 'document:paste:watcher',
    exportImageWatcher: 'image:export:watcher'
};
const log = debug('app:components:image');
type TSaveFormat = 'png' | 'webp' | 'jpg' | 'jpeg';
type TSaveSettings = { format: TSaveFormat; quality: number };

type TSaveModalProps = {
    visible: boolean;
    sourceUrl: string | null;
    baseName: string;
    settings: TSaveSettings;
    setSettings: Dispatch<SetStateAction<TSaveSettings>>;
    onClose: () => void;
};

const SaveModal = ({
    visible,
    sourceUrl,
    baseName,
    settings,
    setSettings,
    onClose
}: TSaveModalProps) => {
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
    const [encodedBlob, setEncodedBlob] = useState<Blob | null>(null);
    const [isEncoding, setIsEncoding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const encodeIdRef = useRef(0);
    const encodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sourceRef = useRef<{ url: string; image: HTMLImageElement } | null>(null);

    const isLossy = settings.format !== 'png';

    useEffect(() => {
        if (!visible) {
            setEstimatedSize(null);
            setEncodedBlob(null);
            setIsEncoding(false);
            setIsSaving(false);
            setError(null);
            sourceRef.current = null;
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSaving) onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [visible, onClose, isSaving]);

    useEffect(() => {
        if (!visible) return;

        if (!sourceUrl) {
            setError('No image available to export.');
            setEncodedBlob(null);
            setEstimatedSize(null);
            setIsEncoding(false);
            return;
        }

        const encodeId = ++encodeIdRef.current;
        setIsEncoding(true);
        setError(null);
        setEncodedBlob(null);
        setEstimatedSize(null);

        if (encodeTimeoutRef.current) {
            clearTimeout(encodeTimeoutRef.current);
        }

        encodeTimeoutRef.current = setTimeout(() => {
            const encode = async () => {
                const mime = settings.format === 'png'
                    ? 'image/png'
                    : settings.format === 'webp'
                        ? 'image/webp'
                        : 'image/jpeg';

                const quality = Math.min(1, Math.max(0.5, settings.quality));

                const image = sourceRef.current?.url === sourceUrl
                    ? sourceRef.current.image
                    : await loadImage(sourceUrl);

                if (sourceRef.current?.url !== sourceUrl) {
                    sourceRef.current = { url: sourceUrl, image };
                }

                const width = image.naturalWidth || image.width;
                const height = image.naturalHeight || image.height;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas context unavailable');

                if (mime === 'image/jpeg') {
                    context.fillStyle = '#000';
                    context.fillRect(0, 0, width, height);
                }

                context.drawImage(image, 0, 0, width, height);

                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((result) => {
                        if (!result) {
                            reject(new Error('Encoding failed'));
                            return;
                        }
                        resolve(result);
                    }, mime, mime === 'image/png' ? undefined : quality);
                });

                return blob;
            };

            encode().then((blob) => {
                if (encodeIdRef.current !== encodeId) return;
                setEncodedBlob(blob);
                setEstimatedSize(blob.size);
                setIsEncoding(false);
            }).catch((err) => {
                if (encodeIdRef.current !== encodeId) return;
                log(err);
                setError('Failed to encode image.');
                setEncodedBlob(null);
                setEstimatedSize(null);
                setIsEncoding(false);
            });
        }, 200);

        return () => {
            if (encodeTimeoutRef.current) {
                clearTimeout(encodeTimeoutRef.current);
            }
        };
    }, [visible, sourceUrl, settings.format, settings.quality]);

    const onSave = async () => {
        if (!encodedBlob) return;
        setIsSaving(true);
        const filename = `${baseName}.${settings.format}`;
        try {
            const ok = await saveAsAdaptive(encodedBlob, filename);
            if (ok) {
                onClose();
            }
        } catch (err) {
            log(err);
            setError('Export failed.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="save-modal-backdrop" onMouseDown={(event) => {
            if (isSaving) return;
            event.stopPropagation();
            onClose();
        }}>
            <div className="save-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="save-header">
                    <div className="title">Export image</div>
                    <div className="close" onClick={() => {
                        if (!isSaving) onClose();
                    }} />
                </div>

                <div className="save-body">
                    <div className="save-row">
                        <label>Format</label>
                        <select
                            value={settings.format}
                            onChange={(event) => {
                                const format = event.target.value as TSaveFormat;
                                setSettings((prev) => ({ ...prev, format }));
                            }}
                        >
                            <option value="png">PNG (lossless)</option>
                            <option value="webp">WebP</option>
                            <option value="jpg">JPG</option>
                            <option value="jpeg">JPEG</option>
                        </select>
                    </div>

                    <div className="save-row">
                        <label>Quality</label>
                        <div className={"save-quality" + (isLossy ? "" : " disabled")}>
                            <input
                                type="range"
                                min="0.5"
                                max="1"
                                step="0.01"
                                value={settings.quality}
                                disabled={!isLossy}
                                onChange={(event) => {
                                    const next = Math.min(1, Math.max(0.5, Number(event.target.value)));
                                    setSettings((prev) => ({ ...prev, quality: next }));
                                }}
                            />
                            <span>{isLossy ? `${Math.round(settings.quality * 100)}%` : 'Lossless'}</span>
                        </div>
                    </div>

                    <div className="save-row">
                        <label>Estimate</label>
                        <div className="save-size">
                            {isEncoding ? 'Calculating...' : estimatedSize ? formatBytes(estimatedSize) : '--'}
                        </div>
                    </div>

                    {error ? <div className="save-error">{error}</div> : null}
                </div>

                <div className="save-actions">
                    <ButtonSet items={[
                        { text: 'Cancel', onClick: onClose, disabled: isSaving },
                        {
                            text: isSaving ? 'Exporting...' : 'Export',
                            onClick: onSave,
                            disabled: isSaving || isEncoding || !encodedBlob || !!error
                        }
                    ]} />
                </div>
            </div>
        </div>
    );
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
                <Tooltip text="Export the current canvas">
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

    useEffect(() => { settersRef.current = setters }, [setters]);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (imgRef.current) {
                imgRef.current.style.opacity = '1';
            }
        })
    }, [current?.loaded])

    // Handles image zooming events
    useEffect(() => {
        if (!imgRef.current) return;

        zoomRef.current = new Drift(imgRef.current, {
            paneContainer: document.body.querySelector('#root > div.wrapper') as HTMLDivElement,
            sourceAttribute: 'src',
            handleTouch: false
        });

        return () => zoomRef.current?.destroy()
    }, [isZooming]);
    
    // Set up binds on component mount
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

    // Update image source when current changes
    useEffect(() => {
        if (current.loaded && imgRef.current) {
            imgRef.current.src = current.loaded.url;
        }
    }, [current.loaded]);

    // Retrieve the current image URL (prioritize showing the edited image)
    const currentUrl = current.edited?.url
        ? current.edited.url
        : current.loaded?.url || undefined;

    const sourceName = current.edited?.file?.name
        || current.loaded?.file?.name
        || 'image';
    const baseName = stripExtension(sourceName);

    return (
        <div className={"image" + (isZooming ? " zooming" : "")} onMouseDown={(e) => {
            if (e.button === 2 || (e.button === 0 && e.ctrlKey) || isZooming) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            setZooming(true);
        }} onMouseUp={() => setZooming(false)} >
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
                save  : current.edited || current.loaded ? () => { setSaveOpen(true); } : null,
                open  : currentUrl ? () => { window.open(currentUrl, '_blank'); } : null
            }}/>

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
