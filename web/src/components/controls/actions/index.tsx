
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';
import { Button, ButtonSet } from '@/components/';

import Processor from '@/workers/processor?worker';

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature;

const processor = new Processor();

export const Actions = ({ current, setters, workflow, busy }: TActionsSignature) => {
    const onProcess = () => {
        if (!current.loaded || busy.state) return;
        busy.update(true);
        processor.postMessage({ workflow, image: current.loaded });
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            busy.update(false);
            setters.edit(event.data ? event.data.image : null);
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
                onClick: onProcess,
                icon: 'process'
            }} />

            <ButtonSet style={{ marginTop: '10px' }} items={[
                { text: 'Export', disabled: workflow.length === 0 },
                { text: 'Import' }
            ]}/>
        </div>
    );
};
