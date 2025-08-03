import { Config } from '@/config';

/**
 * File input
 */
export const InputFile = () => {
    return (
        <div className="section file-input">
            <div className="sub-header">File selection:</div>
            <input type="file" accept={Config.Filetypes.Allowed.join(', ')} />
        </div>
    );
};
