import type { TWorkItem } from '@/data/types';

import { useCallback, useEffect, useRef, useState } from 'react';

type TDropHint = { index: number; position: 'before' | 'after' } | null;

const useWorkflowDrag = (setWorkflow: React.Dispatch<React.SetStateAction<TWorkItem[]>>) => {
    const draggingIdRef = useRef<TWorkItem['id'] | null>(null);
    const pendingIndexRef = useRef<number | null>(null);
    const dropRafRef = useRef<number | null>(null);
    const [draggingId, setDraggingId] = useState<TWorkItem['id'] | null>(null);
    const [dropHint, setDropHint] = useState<TDropHint>(null);

    const clearDropHint = useCallback(() => {
        if (dropRafRef.current !== null) {
            cancelAnimationFrame(dropRafRef.current);
            dropRafRef.current = null;
        }
        setDropHint(null);
    }, []);

    const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, id: TWorkItem['id']) => {
        if ((event.target as HTMLElement).closest('.options')) {
            event.preventDefault();
            return;
        }
        draggingIdRef.current = id;
        setDraggingId(id);
        clearDropHint();
        pendingIndexRef.current = null;
        event.dataTransfer.effectAllowed = 'move';
    }, [clearDropHint]);

    const onDragEnd = useCallback(() => {
        draggingIdRef.current = null;
        setDraggingId(null);
        pendingIndexRef.current = null;
        clearDropHint();
    }, [clearDropHint]);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>, overIndex: number) => {
        event.preventDefault();
        if (!draggingIdRef.current) return;

        const target = event.currentTarget as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const after = (event.clientY - rect.top) > rect.height / 2;

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
    }, []);

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

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
    }, [clearDropHint, setWorkflow]);

    useEffect(() => {
        return () => {
            if (dropRafRef.current !== null) {
                cancelAnimationFrame(dropRafRef.current);
            }
        };
    }, []);

    return {
        draggingId,
        dropHint,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDrop
    };
};

export { useWorkflowDrag };
