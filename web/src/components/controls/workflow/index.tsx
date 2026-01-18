import type { TWorkItem } from '@/data/types';

import { useCallback } from 'react';
import { WorkflowItem } from './workflow-item';
import { useWorkflowDrag } from './useWorkflowDrag';

import './index.scss';

type TWorkflowSignature = {
    workflow: TWorkItem[];
    setWorkflow: React.Dispatch<React.SetStateAction<TWorkItem[]>>;
    selectedId: string | null;
    onSelect: (item: TWorkItem) => void;
};

/**
 * Workflow component
 * 
 * Contains the active modes and effects that will be used to process the image
 */
export const Workflow = ({ workflow, setWorkflow, selectedId, onSelect }: TWorkflowSignature) => {
    const { draggingId, dropHint, onDragStart, onDragOver, onDragEnd, onDrop } = useWorkflowDrag(setWorkflow);

    const onRemove = useCallback((item: TWorkItem) => {
        setWorkflow((previous) => previous.filter((current) => {
            return current.id !== item.id;
        }));
    }, [setWorkflow]);

    const onToggle = useCallback((item: TWorkItem) => {
        setWorkflow((previous) => previous.map((current) => {
            if (current.id === item.id) {
                return {...current, muted: !current.muted}
            }

            return current;
        }));
    }, [setWorkflow]);

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
                                isSelected={selectedId === item.id}
                                onSelect={onSelect}
                                draggable
                                isDragging={draggingId === item.id}
                                dropPosition={dropHint?.index === index ? dropHint.position : null}
                                onDragStart={(event) => onDragStart(event, item.id)}
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
