
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';
import { Hooks } from '@/modules';

import Processor from '@/workers/processor?worker';
import { MessageType } from '@/data/enums';

const processor = new Processor();

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature;

export const Actions = ({ current, setters, workflow, busy }: TActionsSignature) => {
    const onProcess = () => {
        if (busy.state) {
            return;
        }

        if (current?.loaded) {
            busy.update(true);
            processor.postMessage({ workflow, image: current.loaded });
        } else {
            Hooks.senders.notify(MessageType.ERROR, 'No image has been loaded — load one before editing.');
        }
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            busy.update(false);

            if (event.data) {
                setters.edit(event.data.image);
            }
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
