import type { TCurrentFile } from '@/data/types';

import { Config } from '@/config';

/**
 * File input
 */

export const InputFile = ({ setFile }: { setFile: React.Dispatch<React.SetStateAction<TCurrentFile>> }) => {
    const eventOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (files && files.length > 0 && Config.Filetypes.Allowed.includes(files[0].type)) {
            setFile({ file: files[0], url: URL.createObjectURL(files[0]) });
        }
    };

    return (
        <div className="section file-input">
            <div className="sub-header">File selection:</div>
            <input onChange={eventOnChange} type="file" accept={Config.Filetypes.Allowed.join(', ')} />
        </div>
    );
};
