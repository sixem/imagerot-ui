
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';
import { Button, ButtonSet } from '@/components/';

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
            <Button {...{
                text: 'Process image',
                disabled: !current.loaded || busy.state,
                onClick: onProcess
            }} />

            <ButtonSet style={{ marginTop: '10px' }} items={[
                { text: 'Export workflow', disabled: workflow.length === 0 },
                { text: 'Import workflow' }
            ]}/>
        </div>
    );
};
