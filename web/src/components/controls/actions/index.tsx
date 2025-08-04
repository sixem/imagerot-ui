
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import Processor from '@/workers/processor?worker';
import { useEffect } from 'react';

const processor = new Processor();

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature;

export const Actions = ({ current, setters, workflow }: TActionsSignature) => {
    const onProcess = () => {
        if (current?.loaded) {
            processor.postMessage({ workflow, image: current.loaded });
        } else {
            console.error("Current isn't loaded", current);
        }
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput>) => {
            setters.edit(event.data.image);
        };

        return () => { processor.onmessage = null; };
    }, []);

    return (
        <div className="">
            <div className="button" onClick={onProcess}>
                <span>Process image</span>
            </div>

            <div className="button-set" style={{ marginTop: '10px' }}>
                <div className="button">Export workflow</div>
                <div className="button">Import workflow</div>
            </div>
        </div>
    );
};
