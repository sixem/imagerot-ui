import type { TImageFile } from '@/data/types';

import { useRef } from 'react';
import { config } from '@/config';

import './file.scss';

/**
 * File input
 */
export const InputFile = ({ setter, text }: { setter: (image: TImageFile | null) => void; text?: string; }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const label = text ?? 'Drop files anywhere, or click to select a file.';

    const eventOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files && files.length > 0 && config.filetypes.allowed.includes(files[0].type)) {
            const file = files[0];
            const id = self.crypto.randomUUID();
            
            setter({ file, id, url: URL.createObjectURL(file), size: file.size });
        }
    };

    return (
        <div className="file-drop">
            <input onChange={eventOnChange} ref={inputRef} type="file" accept={config.filetypes.allowed.join(', ')} />
            <div className="file-drop-target" onClick={() => inputRef?.current?.click() }>
                <span>{label}</span>
            </div>
        </div>
    );
};
