
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';
import { Hooks } from '@/modules';

import Processor from '@/workers/processor?worker';
import { MessageType } from '@/data/enums';

const processor = new Processor();

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature;

export const Actions = ({ current, setters, workflow }: TActionsSignature) => {
    const onProcess = () => {
        if (current?.loaded) {
            processor.postMessage({ workflow, image: current.loaded });
        } else {
            Hooks.senders.notify(MessageType.ERROR, 'No image has been loaded — load one before editing.');
        }
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            if (event.data) {
                setters.edit(event.data.image);
            }
        };

        return () => {
            processor.onmessage = null;
        };
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
