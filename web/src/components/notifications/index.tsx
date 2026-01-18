import type { TNotifyItem } from '@/data/types';

import { useEffect, useState, useCallback, useRef } from 'react';
import { hooks, triggers } from '@/modules';
import { useTimeouts } from '@/modules/hooks';
import { config } from '@/config';

import './index.scss';

const hookId = { appNotifyWatcher: 'app:notify:watcher' };

export const Notifications = () => {
    const [items, setItems] = useState<(TNotifyItem & { id: number; visible: boolean; })[]>([]);
    const idRef = useRef(0);
    const aliveRef = useRef(true);
    const { scheduleTimeout, clearTimeouts } = useTimeouts();

    // Removes a notification by its ID
    const notificationRemove = useCallback((id: number) => {
        setItems(previous => previous.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, visible: false };
                scheduleTimeout(() => {
                    if (aliveRef.current) {
                        setItems(previous => previous.filter((item) => item.id !== id));
                    }
                }, 500);
                return updatedItem;
            }
            return item;
        }));
    }, [scheduleTimeout]);

    // Handles notifications received and places them into the current state
    const onNotifyReceive = useCallback((data: TNotifyItem) => {
        const { type, message, duration } = data;
        const id = idRef.current++;

        // Make item invisible
        setItems(previous => [...previous, { id, type, message, visible: false }]);

        // Request a new frame (allow render and transition to sync) and make item visible
        requestAnimationFrame(() => {
            if (!aliveRef.current) return;
            setItems(previous => previous.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, visible: true };
                    scheduleTimeout(() => {
                        if (aliveRef.current) {
                            notificationRemove(item.id);
                        }
                    }, duration || config.notifications.defaultDuration);
                    return updatedItem;
                }
                return item;
            }));
        });
    }, [notificationRemove, scheduleTimeout]);

    useEffect(() => {
        hooks.watch({
            trigger: triggers.notify,
            identifier: hookId.appNotifyWatcher,
            callback: onNotifyReceive
        });

        return () => {
            hooks.unwatch({
                trigger: triggers.notify,
                identifier: hookId.appNotifyWatcher
            });
        }
    }, [onNotifyReceive]);

    useEffect(() => {
        aliveRef.current = true;

        return () => {
            aliveRef.current = false;
            clearTimeouts();
        };
    }, [clearTimeouts]);

    return (
        <div className="notifier">
            {items.map((item) => {
                return (
                    <div className={"notify-item" + (item.visible ? "" : " hidden")} data-type={item.type} key={item.id} onClick={() => {
                        notificationRemove(item.id)
                    }}>
                        <span>{item.message}</span>
                    </div>
                );
            })}
        </div>
    );
};
