
import type { TWorkItem, TPaneSignature, TProcessorOutput } from '@/data/types';

import { useEffect, useRef } from 'react';
import { MessageType, WorkItemType, StorageKeys } from '@/data/enums';
import { Button, ButtonSet } from '@/components/';
import { estimates, hooks } from '@/modules';
import { debug, pick, saveAsAdaptive, useStoredState } from '@/utils';
import { listEffects, listModes } from 'imagerot/browser';

import Processor from '@/workers/processor?worker';

type TActionsSignature = { workflow: TWorkItem[]; } & TPaneSignature & {
    estimated: number | null;
};

type TWorkflowExportItem = Pick<TWorkItem, 'key' | 'type' | 'muted' | 'config'>;

type TWorkflowExport = {
    items: TWorkflowExportItem[]
};

const log = debug('app:controls:actions');
const processor = new Processor();

/**
 * Converts an array of workflow items into a JSON string for export
 * Returns null on invalid or empty data.
 */
const workflowToJson = (data: TWorkItem[]): string | null => {
    const items = data.map((item) => {
        return pick(item, ['key', 'type', 'muted', 'config']);
    });

    return items.length > 0 ? JSON.stringify({ items } as TWorkflowExport) : null;
};

/**
 * Parses a JSON string containing workflow items into an array of `TWorkflowExportItem`
 * Returns null on invalid or empty data.
 */
const workflowFromJson = (data: string): TWorkflowExportItem[] | null => {
    try {
        const parsed = JSON.parse(data) as TWorkflowExport;

        if (!parsed.items) return null;

        const effects = new Set(listEffects());
        const types   = new Set(Object.values(WorkItemType));
        const modes   = new Set(listModes());

        return parsed.items.map((item) => {
            const { key, type, muted, config } = item;

            if (!types.has(type)) return null;

            switch (type) {
                case WorkItemType.effect: {
                    return effects.has(key)
                        ? { key, type, muted: muted ?? false, config: config || {} }
                        : null
                };

                case WorkItemType.mode: {
                    return modes.has(key)
                        ? { key, type, muted: muted ?? false, config: null }
                        : null
                }

                default: return null
            }
        }).filter((item) => item !== null);
    } catch (error) {
        log(error);
        return null;
    }
};


/**
 * Attempts to export and save the current workflow to a local .json file.
*/
const saveWorkflow = async (workflow: TWorkItem[]) => {
    const converted = workflowToJson(workflow);

    if (converted) {
        const blob = new Blob([converted], { type: 'application/json' });

        if (await saveAsAdaptive(blob, 'workflowExport')) {
            hooks.senders.notify(MessageType.ok, 'Workflow exported');
        }
    }
};

export const Actions = ({ current, setters, workflow, busy, estimated }: TActionsSignature) => {
    const [isReversed, setReversed] = useStoredState<boolean>(StorageKeys.uiReversed, false);

    const busyRef = useRef(busy);
    const settersRef = useRef(setters);

    useEffect(() => { busyRef.current = busy; }, [busy]);
    useEffect(() => { settersRef.current = setters; }, [setters]);

    const onProcess = () => {
        if (current.loaded && !busy.state) { // Send data to worker
            busy.update(true);
            log("Processing image", { workflow, current: current.loaded });
            processor.postMessage({ workflow, image: current.loaded });
        }
    };

    useEffect(() => {
        processor.onmessage = (event: MessageEvent<TProcessorOutput | null>) => {
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

        return () => {
            busyRef.current.update(false);
            processor.onmessage = null;
        };
    }, []);

    return (
        <div className="">
            <Button {...{
                text: 'Process image' + (
                    (estimated && workflow.filter(item => !item.muted).length > 0)
                        ? ` (~${(estimated / 1000).toFixed(3)}s)` : ""
                ),
                disabled: !current.loaded || busy.state,
                onClick: onProcess,
                icon: 'process'
            }} />

            <ButtonSet style={{ marginTop: '10px' }} items={[
                { text: 'Export workflow', disabled: workflow.length === 0, onClick: () => saveWorkflow(workflow)},
                { text: 'Import workflow' , onClick: () => workflowFromJson("") },
                { text: null, tooltip: "Reverse the interface UI", icon: 'reverse', onClick: () => setReversed(!isReversed) }
            ]}/>
        </div>
    );
};
