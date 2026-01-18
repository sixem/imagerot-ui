
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect, useRef } from 'react';
import { MessageType, StorageKeys } from '@/data/enums';
import { Button, ButtonSet } from '@/components/';
import { estimates, hooks, triggers } from '@/modules';
import { debug, saveWorkflow, uid, useStoredState, workflowFromJson } from '@/utils';

import Processor from '@/workers/processor?worker';

type TActionsSignature = TPaneSignature & {
    estimated: number | null;
    workflow: TWorkItem[];
} & { setters: { workflow: Dispatch<SetStateAction<TWorkItem[]>> }};

const log = debug('app:controls:actions');

export const Actions = ({ current, setters, busy, estimated, workflow }: TActionsSignature) => {
    const [isReversed, setReversed] = useStoredState<boolean>(StorageKeys.uiReversed, false);

    const inputRef     = useRef<HTMLInputElement>(null);
    const busyRef      = useRef(busy);
    const settersRef   = useRef(setters);
    const processorRef = useRef<Worker | null>(null);

    useEffect(() => { busyRef.current = busy; }, [busy]);
    useEffect(() => { settersRef.current = setters; }, [setters]);

    // Called when starting a new image generation
    const onProcess = async () => {
        if (!current.loaded || busy.state || !processorRef.current) return;
        if (!current.loaded.file) {
            hooks.senders.notify(MessageType.error, 'Could not read the image file');
            return;
        }

        busy.update(true);
        log("Processing image", { workflow, current: current.loaded });

        try {
            const file = current.loaded.file;
            const buffer = await file.arrayBuffer();

            processorRef.current.postMessage({
                workflow,
                image: {
                    buffer,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    id: current.loaded.id
                }
            }, [buffer]);
        } catch (error) {
            busy.update(false);
            hooks.senders.notify(MessageType.error, 'Could not prepare image for processing');
            log(error);
        }
    };

    // Called when importing a workflow file
    const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const files = input.files;

        if (files && files.length > 0 && files[0].type.startsWith('application/json')) {
            const file = files[0];

            if (file.size > 1E6) {
                hooks.senders.notify(MessageType.warn, 'File is too large!');
                input.value = '';
                return;
            }

            file.text().then((data) => {
                const items = workflowFromJson(data);

                if (items && items.length > 0) {
                    const workitems = items.map((item) => {
                        const { key, type, config, muted } = item;
                        return { id: uid(), key, type, config, muted }
                    });

                    setters.workflow(workitems || []);
                    hooks.senders.notify(MessageType.ok, `Imported ${items.length} workflow item(s)`);
                }
            }).catch((error) => {
                hooks.senders.notify(MessageType.warn, 'Could not parse import file!');
                log(error);
            });
        }

        input.value = '';
    };

    useEffect(() => {
        const worker = new Processor();
        processorRef.current = worker;

        worker.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
            busyRef.current.update(false);

            if (event.data) {
                log("Got processed image response", event.data);

                if (event.data.estimates && event.data.overhead) {
                    estimates.addRecord(event.data.estimates);
                    estimates.setOverhead(event.data.overhead);
                }
            }

            settersRef.current.edit(event.data ? event.data.image : null);

            if (window.matchMedia('(max-width: 720px)').matches) {
                document.body.scrollTo(0, 0);
            }
        };

        worker.onerror = (event) => {
            busyRef.current.update(false);
            hooks.senders.notify(MessageType.error, 'Image processing failed');
            log("Worker error", event);
        };

        return () => {
            busyRef.current.update(false);
            worker.onmessage = null;
            worker.onerror = null;
            worker.terminate();
            processorRef.current = null;
        };
    }, []);

    const showExport = !!current.edited;

    return (
        <div className="options-bottom">
            <div className="process-row">
                <Button {...{
                    text: 'Process image' + (
                        (estimated && workflow.filter(item => !item.muted).length > 0)
                            ? ` (~${(estimated / 1000).toFixed(3)}s)` : ""
                    ),
                    disabled: !current.loaded || busy.state,
                    onClick: onProcess,
                    icon: 'process'
                }} />

                {showExport ? (
                    <Button
                        text={null}
                        icon="export"
                        tooltip="Export image"
                        disabled={busy.state}
                        onClick={() => {
                            hooks.trigger({ trigger: triggers.exportImage, data: null });
                        }}
                    />
                ) : null}
            </div>

            <input onChange={onImport} ref={inputRef} type="file" accept={'application/json'} />

            <ButtonSet style={{ marginTop: '10px' }} items={[
                { text: 'Export workflow', disabled: workflow.length === 0, onClick: () => saveWorkflow(workflow)},
                { text: 'Import workflow' , onClick: () => inputRef?.current?.click() },
                { text: null, tooltip: "Reverse the interface UI", icon: 'reverse', onClick: () => setReversed(!isReversed) }
            ]}/>
        </div>
    );
};
