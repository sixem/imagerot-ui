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
const WorkflowItem = ({ item, index }: { item: TWorkItem; index: number; }) => {
    const itemClass = "work-item type-" + (item.type === WorkItemType.Mode ? "mode" : "effect");

    return (
        <div data-index={index} className={itemClass}>
            <div className="name">{item.key}</div>
            {item.config ? <div className="config">[{Object.values(item.config).join(', ')}]</div> : null}
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

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            {queue.length > 0 ? (
                <div className="work-order" ref={listRef}>
                    {queue.map((item, index) => {
                        return <WorkflowItem item={item} key={index} index={index} />
                    })}
                </div>
            ) : <div className="label-empty">No workflow items.</div> }
        </div>
    );
};
