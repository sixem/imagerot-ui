import type { TWorkItem } from '../';

import { WorkItemType } from '../';

/**
 * Holds a single effect or mode item
 */
const WorkflowItem = ({ item }: { item: TWorkItem }) => {
    return (
        <div className={"work-item type-" + (item.type === WorkItemType.Mode ? "mode" : "effect")}>
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
export const Workflow = ({ queue }: { queue: TWorkItem[] }) => {
    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            {queue.length > 0 ? (
                <div className="work-order">
                    {queue.map((item, index) => {
                        return <WorkflowItem item={item} key={index} />
                    })}
                </div>
            ) : <div className="label-empty">No workflow items.</div> }
        </div>
    );
};
