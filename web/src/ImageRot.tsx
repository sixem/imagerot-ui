import type { TCurrentFile } from '@/data/types';

import { useEffect, useState } from 'react';
import { Image, Controls } from './components/';
import { binders } from './binders';
import coverImage from '@/assets/cover.jpg';

import './ImageRot.scss';

const ImageRot = () => {
    const [isDropping, setDropping] = useState<boolean>(false);
    const [currentFile, setFile] = useState<TCurrentFile>({
        file: null, url: coverImage
    });

    const dragEvents = {
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            console.log("onDrop", event.dataTransfer.files);

            setDropping(false);
        },
        onDragEnd: (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            setDropping(false);
        },
        onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!isDropping) {
                setDropping(true);
            }
        },
    };

    useEffect(() => {
        binders.listen(); // Set up listeners and hooks

        return () => {
            binders.unlisten();
        }
    }, []);

    return (
        <div className="wrapper" {...dragEvents} data-dropping={isDropping}>
            <Image
                setFile={setFile}
                currentFile={currentFile}
            />

            <Controls
                setFile={setFile}
                currentFile={currentFile}
            />
        </div>
    );
};

export default ImageRot;
