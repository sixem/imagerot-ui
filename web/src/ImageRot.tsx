import { useEffect } from 'react';
import { Image, Controls } from './components/';
import { binders } from './binders';

import './ImageRot.scss';

const ImageRot = () => {
    useEffect(() => {
        binders.listen();

        return () => {
            binders.unlisten();
        };
    });

    return (
        <div className="wrapper">
            <Image />
            <Controls />
        </div>
    );
};

export default ImageRot;
