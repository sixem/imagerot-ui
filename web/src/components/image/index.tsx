import { useRef, useEffect } from 'react';
import { Hooks, Triggers } from '@/modules/';
import coverImage from '@/assets/cover.jpg';
import './index.scss';

const HOOK_ID = {
    DOCUMENT_PASTE_WATCHER: 'document:paste:watcher',
};

type TOptionsProps = {
    reset: () => void;
    open : () => void;
    save : () => void;
};

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

    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.style.opacity = '1';
        }

        Hooks.watch({
            trigger: Triggers.DOCUMENT_PASTE,
            identifier: HOOK_ID.DOCUMENT_PASTE_WATCHER,
            callback: (file: DataTransferItem) => {
                console.debug(file);
            }
        });
    });

    return (
        <div className="image">
            <img id="output" ref={imgRef} src={coverImage} />
            <Options {...{
                reset : () => console.debug('reset'),
                open  : () => console.debug('open'),
                save  : () => console.debug('save'),
            }}/>
        </div>
    );
};

export { Image };
