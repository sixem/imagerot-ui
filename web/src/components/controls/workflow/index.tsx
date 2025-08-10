import type { TWorkItem } from '@/data/types';

import { useRef } from 'react';
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
type TWorkflowItemProps = {
    item: TWorkItem;
    index: number;
    onRemove: (item: TWorkItem) => void;
    onToggle: (item: TWorkItem) => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
};

const WorkflowItem = ({ item, index, onRemove, onToggle, draggable, onDragStart, onDragOver, onDragEnd }: TWorkflowItemProps) => {
    const type = item.type === WorkItemType.mode ? "mode" : "effect";
    const isToggled = !!item.muted;
    const classList = ['work-item', "type-" + type];

    if (isToggled) {
        classList.push('dimmed');
    }

    return (
        <div
            data-index={index}
            className={classList.join(' ')}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
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
    const draggingId = useRef<TWorkItem['id'] | null>(null); // added

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

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: TWorkItem['id']) => {
        if ((e.target as HTMLElement).closest('.options')) { e.preventDefault(); return; }
        draggingId.current = id;
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = () => {
        draggingId.current = null;
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>, overIndex: number) => {
        e.preventDefault();

        const target = e.currentTarget as HTMLDivElement;
        const rect   = target.getBoundingClientRect();
        const after  = (e.clientY - rect.top) > rect.height / 2;

        let insertIndex = overIndex + (after ? 1 : 0);

        setWorkflow((previous) => {
            const from = previous.findIndex(x => x.id === draggingId.current);

            if (from < 0) return previous;
            if (insertIndex > previous.length) insertIndex = previous.length;
            if (from < insertIndex) insertIndex--;
            if (from === insertIndex) return previous;

            const next = previous.slice();
            const [moved] = next.splice(from, 1);

            next.splice(insertIndex, 0, moved);
            
            return next;
        });
    };

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items ({workflow.filter((item) => !item.muted).length}):</div>
            {workflow.length > 0 ? (
                <div className="work-order" ref={listRef}>
                    {workflow.map((item, index) => {
                        return (
                            <WorkflowItem
                                {...{ item, index, onRemove, onToggle }}
                                key={item.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, item.id)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                            />
                        );
                    })}
                </div>
            ) : <div className="label-empty">The workflow is empty</div> }
        </div>
    );
};
