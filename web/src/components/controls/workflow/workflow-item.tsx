import type { TWorkItem } from '@/data/types';

import { Tooltip } from '@/components/tooltips';
import { WorkItemType } from '@/data/enums';

type TWorkflowItemProps = {
    item: TWorkItem;
    index: number;
    draggable?: boolean;
    onRemove: (item: TWorkItem) => void;
    onToggle: (item: TWorkItem) => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
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
            data-dragging={isDragging ? "true" : undefined}
            data-drop={dropPosition ?? undefined}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
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

export { WorkflowItem };
