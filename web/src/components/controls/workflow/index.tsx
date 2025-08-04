import type { TWorkItem } from '@/data/types';

import { useRef } from 'react';
import { WorkItemType } from '@/data/enums';

type TWorkflowSignature = {
    workflow: TWorkItem[];
    setWorkflow: React.Dispatch<React.SetStateAction<TWorkItem[]>>
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
        <div data-index={index} className={"work-item type-" + (item.type === WorkItemType.MODE ? "mode" : "effect")}>
            <div className="text">
                <div>{item.key}</div>
                {item.config ? <div className="config">
                    <span>[{Object.values(item.config).join('; ')}]</span>
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
export const Workflow = ({ workflow, setWorkflow }: TWorkflowSignature) => {
    const listRef = useRef<HTMLDivElement>(null);

    // TODO: Add reordering.
    // setWorkflow (param) updates the workflow queue and will be needed when we add re-orderable items here

    const onRemove = (item: TWorkItem) => {
        setWorkflow((previous) => previous.filter((current) => {
            return current !== item;
        }));
    };

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            {workflow.length > 0 ? (
                <div className="work-order" ref={listRef}>
                    {workflow.map((item, index) => {
                        return <WorkflowItem {...{ item, index, onRemove }} key={index} />
                    })}
                </div>
            ) : <div className="label-empty">No workflow items.</div> }
        </div>
    );
};
