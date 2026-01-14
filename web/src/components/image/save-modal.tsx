import type { Dispatch, SetStateAction } from 'react';

import { useEffect, useRef, useState } from 'react';
import { ButtonSet } from '@/components/button';
import { debug, formatBytes, loadImage, saveAsAdaptive } from '@/utils';

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

const log = debug('app:components:image:save-modal');

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
            <div className="save-modal" onMouseDown={(event) => event.stopPropagation()}>
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

export type { TSaveFormat, TSaveSettings };
export { SaveModal };
