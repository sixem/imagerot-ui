
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';

import Processor from '@/workers/processor?worker';

const processor = new Processor();

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature;

export const Actions = ({ current, setters, workflow, busy }: TActionsSignature) => {
    const onProcess = () => {
        if (!current.loaded || busy.state) return;
        busy.update(true);
        processor.postMessage({ workflow, image: current.loaded });
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            busy.update(false);

            if (event.data) {
                setters.edit(event.data.image);
            }
        };

        return () => {
            busy.update(false);
            processor.onmessage = null;
        };
    }, []);

    return (
        <div className="">
            <div className={"button" + (!current.loaded || busy.state ? " disabled" : "")} onClick={onProcess}>
                <span>Process image</span>
            </div>

            <div className="button-set" style={{ marginTop: '10px' }}>
                <div className={"button" + (workflow.length === 0 ? " disabled" : "")}>Export workflow</div>
                <div className="button">Import workflow</div>
            </div>
        </div>
    );
};
