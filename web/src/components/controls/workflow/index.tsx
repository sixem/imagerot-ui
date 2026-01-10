import type { TWorkItem } from '@/data/types';

import { useRef, useState } from 'react';
import { WorkItemType } from '@/data/enums';

import './index.scss';
import { Tooltip } from '@/components/tooltips';

type TWorkflowSignature = {
    workflow    : TWorkItem[];
    setWorkflow : React.Dispatch<React.SetStateAction<TWorkItem[]>>;
};

/**
 * Holds a single effect or mode item
 */
type TWorkflowItemProps = {
    item       : TWorkItem;
    index      : number;
    draggable? : boolean;
    onRemove : (item: TWorkItem) => void;
    onToggle : (item: TWorkItem) => void;
    onDragStart? : (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?  : (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?   : (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop?      : (e: React.DragEvent<HTMLDivElement>) => void;
    isDragging?: boolean;
    dropPosition?: 'before' | 'after' | null;
};

const WorkflowItem = ({
    item,
    index,
    draggable,
    onRemove,
    onToggle,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    isDragging = false,
    dropPosition = null
}: TWorkflowItemProps) => {
    const type      = item.type === WorkItemType.mode ? "mode" : "effect";
    const isToggled = !!item.muted;
    const classList = ['work-item', "type-" + type];

    if (isToggled) {
        classList.push('dimmed');
    }

    return (
        <div
            data-index  = {index}
            className   = {classList.join(' ')}
            data-dragging = {isDragging ? "true" : undefined}
            data-drop = {dropPosition ?? undefined}
            draggable   = {draggable}
            onDragStart = {onDragStart}
            onDragOver  = {onDragOver}
            onDragEnd   = {onDragEnd}
            onDrop      = {onDrop}
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
    const draggingIdRef = useRef<TWorkItem['id'] | null>(null);
    const pendingIndexRef = useRef<number | null>(null);
    const dropRafRef = useRef<number | null>(null);
    const [draggingId, setDraggingId] = useState<TWorkItem['id'] | null>(null);
    const [dropHint, setDropHint] = useState<{ index: number; position: 'before' | 'after' } | null>(null);

    const clearDropHint = () => {
        if (dropRafRef.current !== null) {
            cancelAnimationFrame(dropRafRef.current);
            dropRafRef.current = null;
        }
        setDropHint(null);
    };

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
        draggingIdRef.current = id;
        setDraggingId(id);
        clearDropHint();
        pendingIndexRef.current = null;
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = () => {
        draggingIdRef.current = null;
        setDraggingId(null);
        pendingIndexRef.current = null;
        clearDropHint();
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>, overIndex: number) => {
        e.preventDefault();
        if (!draggingIdRef.current) return;

        const target = e.currentTarget as HTMLDivElement;
        const rect   = target.getBoundingClientRect();
        const after  = (e.clientY - rect.top) > rect.height / 2;

        const insertIndex = overIndex + (after ? 1 : 0);
        pendingIndexRef.current = insertIndex;

        const nextHint = { index: overIndex, position: after ? 'after' : 'before' as const };

        if (dropRafRef.current !== null) cancelAnimationFrame(dropRafRef.current);
        dropRafRef.current = requestAnimationFrame(() => {
            setDropHint((previous) => {
                if (previous && previous.index === nextHint.index && previous.position === nextHint.position) {
                    return previous;
                }
                return nextHint;
            });
        });
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const insertIndex = pendingIndexRef.current;
        if (insertIndex === null) return;

        setWorkflow((previous) => {
            let targetIndex = insertIndex;
            const from = previous.findIndex(x => x.id === draggingIdRef.current);

            if (from < 0) return previous;
            if (targetIndex > previous.length) targetIndex = previous.length;
            if (from < targetIndex) targetIndex--;
            if (from === targetIndex) return previous;

            const next = previous.slice();
            const [moved] = next.splice(from, 1);

            next.splice(targetIndex, 0, moved);

            return next;
        });

        pendingIndexRef.current = null;
        clearDropHint();
    };

    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items ({workflow.filter((item) => !item.muted).length}):</div>
            {workflow.length > 0 ? (
                <div className="work-order">
                    {workflow.map((item, index) => {
                        return (
                            <WorkflowItem
                                {...{ item, index, onRemove, onToggle }}
                                key={item.id}
                                draggable
                                isDragging={draggingId === item.id}
                                dropPosition={dropHint?.index === index ? dropHint.position : null}
                                onDragStart={(e) => onDragStart(e, item.id)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                                onDrop={onDrop}
                            />
                        );
                    })}
                </div>
            ) : <div className="label-empty">The workflow is empty</div> }
        </div>
    );
};
