import type { TWorkItem } from '../';

import { useRef } from 'react';
import { WorkItemType } from '../';

type TWorkflowSignature = {
    queue: TWorkItem[];
    updater: React.Dispatch<React.SetStateAction<TWorkItem[]>>
};

/**
 * Holds a single effect or mode item
 */
const WorkflowItem = ({ item, index, onRemove }: {
    item: TWorkItem;
    index: number;
    onRemove: (item: TWorkItem, index: number) => void;
}) => {
    return (
        <div data-index={index} className={"work-item type-" + (item.type === WorkItemType.Mode ? "mode" : "effect")}>
            <div className="text">
                <div>{item.key}</div>
                {item.config ? <div className="config">
                    <span>[{Object.values(item.config).join(', ')}]</span>
                </div> : null}
            </div>

            <div className="options">
                <div className="remove" onClick={() => onRemove(item, index)} />
            </div>
        </div>
    );
};

/**
 * Workflow component
 * 
 * Contains the active modes and effects that will be used to process the image
 */
export const Workflow = ({ queue, updater }: TWorkflowSignature) => {
    const listRef = useRef<HTMLDivElement>(null);

    // TODO: Add reordering.
    // Updater (param) updates the queue and will be needed when we add re-orderable items here

    const onRemove = (item: TWorkItem) => {
        updater((previous) => previous.filter((current) => {
            return current !== item;
        }));
    };

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            {queue.length > 0 ? (
                <div className="work-order" ref={listRef}>
                    {queue.map((item, index) => {
                        return <WorkflowItem {...{ item, index, onRemove }} key={index} />
                    })}
                </div>
            ) : <div className="label-empty">No workflow items.</div> }
        </div>
    );
};
