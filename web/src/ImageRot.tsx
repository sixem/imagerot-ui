import { useState } from 'react';
import { Image, Controls } from './components';
import './ImageRot.scss';

const ImageRot = () => {
    return (
        <div className="wrapper">
            <Image />
            <Controls />
        </div>
    );
};

export default ImageRot;
