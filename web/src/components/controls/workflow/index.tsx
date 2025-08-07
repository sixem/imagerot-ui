import type { TWorkItem } from '@/data/types';

import { useRef, useState } from 'react';
import { WorkItemType } from '@/data/enums';

import './index.scss';
import { Tooltip } from '@/components/tooltips';

type TWorkflowSignature = {
    workflow: TWorkItem[];
    setWorkflow: React.Dispatch<React.SetStateAction<TWorkItem[]>>
};

/**
 * Holds a single effect or mode item
 */
const WorkflowItem = ({ item, index, onRemove, onToggle }: {
    item: TWorkItem;
    index: number;
    onRemove: (item: TWorkItem) => void;
    onToggle: (item: TWorkItem) => void;
}) => {
    const type = item.type === WorkItemType.MODE ? "mode" : "effect";
    const isToggled = !!item.muted;
    const classList = ['work-item', "type-" + type];

    if (isToggled) {
        classList.push('dimmed');
    }

    return (
        <div data-index={index} className={classList.join(' ')}>
            <div className="text">
                <div>{item.key}</div>
                {item.config ? <div className="config">
                    <span>{Object.values(item.config).join('; ').trim() || ""}</span>
                </div> : null}
            </div>

            <div className="options">
                <Tooltip text={`${isToggled ? "Unmute" : "Mute"} this ${type} during processing`}>
                    <div className={"toggle" + (isToggled ? " toggled" : "")} onClick={() => {
                        onToggle(item);
                    }} />
                </Tooltip>

                <div className="remove" onClick={() => onRemove(item)} />
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
    // setWorkflow (param) updates the workflow queue and will be needed when we add re-orderable items here!

    const onRemove = (item: TWorkItem) => {
        setWorkflow((previous) => previous.filter((current) => {
            return current.id !== item.id;
        }));
    };

    const onToggle = (item: TWorkItem) => {
        setWorkflow((previous) => previous.map((current) => {
            if (current.id === item.id) {
                return {...current, muted: !current.muted}
            }

            return current;
        }));
    };

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items ({workflow.filter((item) => !item.muted).length}):</div>
            {workflow.length > 0 ? (
                <div className="work-order" ref={listRef}>
                    {workflow.map((item, index) => {
                        return <WorkflowItem {...{ item, index, onRemove, onToggle }} key={item.id} />
                    })}
                </div>
            ) : <div className="label-empty">The workflow is empty</div> }
        </div>
    );
};
