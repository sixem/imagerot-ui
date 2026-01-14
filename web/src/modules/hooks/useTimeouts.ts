import { useCallback, useRef } from 'react';

const useTimeouts = () => {
    const timeoutsRef = useRef(new Set<number>());

    const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
        const id = window.setTimeout(() => {
            timeoutsRef.current.delete(id);
            fn();
        }, delay);

        timeoutsRef.current.add(id);
        return id;
    }, []);

    const clearTimeouts = useCallback(() => {
        timeoutsRef.current.forEach((id) => clearTimeout(id));
        timeoutsRef.current.clear();
    }, []);

    return {
        scheduleTimeout,
        clearTimeouts
    };
};

export { useTimeouts };
