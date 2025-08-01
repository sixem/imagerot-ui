import { useRef, useEffect } from 'react';
import coverImage from '@/assets/cover.jpg';
import './index.scss';

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
    });

    return (
        <div className="image">
            <img id="output" ref={imgRef} src={coverImage} />
            <Options />
        </div>
    );
};

export { Image };
