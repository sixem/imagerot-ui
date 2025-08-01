import { useRef } from 'react';
import coverImage from './assets/cover.jpg';

const Image = () => {
    const imgRef = useRef<HTMLImageElement>(null);

    return (
        <img id="output" ref={imgRef} src={coverImage} />
    );
};

export { Image };
