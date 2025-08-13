import { useEffect, useRef, useState } from 'react';
import { storage } from '@/utils/storage';
import { uid } from '@/utils';

type UpdatePayload<T> = { key: string; value?: T; source?: string };

const channel =
    typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('stored-state-channel')
        : null;

export const useStoredState = <T,>(key: string, initial: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const cached = localStorage.getItem(`stored:${key}`);
            return cached != null ? (JSON.parse(cached) as T) : initial;
        } catch {
            return initial;
        }
    });

    const [loaded, setLoaded] = useState(false);
    const valueRef = useRef(value);
    const sourceRef = useRef<string>(uid());

    useEffect(() => {
        valueRef.current = value;
        try {
            localStorage.setItem(`stored:${key}`, JSON.stringify(value));
        } catch { /** Do nothing */ }
    }, [key, value]);

    useEffect(() => {
        let alive = true;

        (async () => {
            const saved = await storage.get<T>(key);
            if (!alive) return;

            if (saved !== undefined && saved !== valueRef.current) {
                setValue(saved);
            }
            setLoaded(true);
        })();

        const handleUpdate = (
            event: CustomEvent<UpdatePayload<T>> | MessageEvent<UpdatePayload<T>>
        ) => {
            const payload: UpdatePayload<T> | undefined =
                'detail' in event ? event.detail : event.data;

            if (!payload || payload.key !== key) return;
            if (payload.source === sourceRef.current) return;

            if (payload.value !== undefined) {
                if (payload.value !== valueRef.current) setValue(payload.value);
            } else {
                storage.get<T>(key).then((saved) => {
                    if (!alive) return;
                    if (saved !== undefined && saved !== valueRef.current) setValue(saved);
                });
            }
        };

        window.addEventListener(
            `storage-updated:${key}`,
            handleUpdate as EventListener
        );
        channel?.addEventListener('message', handleUpdate);

        return () => {
            alive = false;
            window.removeEventListener(
                `storage-updated:${key}`,
                handleUpdate as EventListener
            );
            channel?.removeEventListener('message', handleUpdate);
        };
    }, [key]);

    useEffect(() => {
        if (!loaded) return;

        (async () => {
            await storage.set(key, value);

            const payload = { key, value, source: sourceRef.current };

            window.dispatchEvent(
                new CustomEvent(`storage-updated:${key}`, { detail: payload })
            );
            channel?.postMessage(payload);
        })();
    }, [key, value, loaded]);

    return [value, setValue, loaded] as const;
};
