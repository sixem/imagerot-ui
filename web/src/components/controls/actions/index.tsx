
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect } from 'react';
import { Button, ButtonSet } from '@/components/';
import { estimates } from '@/modules';
import { debug } from '@/utils';

import Processor from '@/workers/processor?worker';

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature & {
    estimated: number | null;
};

const log = debug('app:controls:actions');
const processor = new Processor();

export const Actions = ({ current, setters, workflow, busy, estimated }: TActionsSignature) => {
    const onProcess = () => {
        if (current.loaded && !busy.state) { // Send data to worker
            busy.update(true);
            log("Processing image", { workflow, current: current.loaded });
            processor.postMessage({ workflow, image: current.loaded });
        }
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            busy.update(false);

            if (event.data) {
                log("Got processed image response", event.data);

                if (event.data.estimates && event.data.overhead) {
                    estimates.addRecord(event.data.estimates);
                    estimates.setOverhead(event.data.overhead);
                }
            }

            setters.edit(event.data ? event.data.image : null);

            if (window.matchMedia('(max-width: 720px)').matches) {
                document.body.scrollTo(0, 0);
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
                text: 'Process image' + (
                    (estimated && workflow.length > 0)
                        ? ` (est. ${(estimated / 1000).toFixed(3)}s)`
                        : ""
                ),
                disabled: !current.loaded || busy.state,
                onClick: onProcess,
                icon: 'process'
            }} />

            <ButtonSet style={{ marginTop: '10px' }} items={[
                { text: 'Export workflow', disabled: workflow.length === 0 },
                { text: 'Import workflow' }
            ]}/>
        </div>
    );
};
