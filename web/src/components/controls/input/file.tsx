import type { TImageFile } from '@/data/types';

import { useRef } from 'react';
import { Config } from '@/config';

/**
 * File input
 */
export const InputFile = ({ setter }: { setter: React.Dispatch<React.SetStateAction<TImageFile | null>> }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const eventOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files && files.length > 0 && Config.filetypes.allowed.includes(files[0].type)) {
            setter({ file: files[0], url: URL.createObjectURL(files[0]), size: files[0].size });
        }
    };

    return (
        <div className="section file-drop">
            <input onChange={eventOnChange} ref={inputRef} type="file" accept={Config.filetypes.allowed.join(', ')} />
            <div className="file-drop-target" onClick={() => inputRef?.current?.click() }>
                <span>Drop files anywhere, or click to select a file.</span>
            </div>
        </div>
    );
};
