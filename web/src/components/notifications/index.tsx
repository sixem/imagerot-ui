import type { TNotifyItem } from '@/data/types';

import { useEffect, useState, useCallback, useRef } from 'react';
import { hooks, triggers } from '@/modules';
import { config } from '@/config';

import './index.scss';

const hookId = { appNotifyWatcher: 'app:notify:watcher' };

export const Notifications = () => {
    const [items, setItems] = useState<(TNotifyItem & { id: number; visible: boolean; })[]>([]);
    const idRef = useRef(0);
    const aliveRef = useRef(true);
    const timeoutsRef = useRef(new Set<number>());

    const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
        const id = window.setTimeout(() => {
            timeoutsRef.current.delete(id);
            if (aliveRef.current) fn();
        }, delay);

        timeoutsRef.current.add(id);
    }, []);

    // Removes a notification by its ID
    const notificationRemove = useCallback((id: number) => {
        setItems(previous => previous.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, visible: false };
                scheduleTimeout(() => {
                    setItems(previous => previous.filter((item) => item.id !== id));
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
                        notificationRemove(item.id);
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
        return () => {
            aliveRef.current = false;
            timeoutsRef.current.forEach((id) => clearTimeout(id));
            timeoutsRef.current.clear();
        };
    }, []);

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
