import type { TNotifyItem } from '@/data/types';

import { useEffect, useState, useCallback } from 'react';
import { hooks, triggers } from '@/modules';
import { config } from '@/config';

import './index.scss';

const hookId = { appNotifyWatcher: 'app:notify:watcher' };

// Tracks the current notification item ID
let currentId = 0;

export const Notifications = () => {
    const [items, setItems] = useState<(TNotifyItem & { id: number; visible: boolean; })[]>([]);

    // Removes a notification by its ID
    const notificationRemove = useCallback((id: number) => {
        setItems(previous => previous.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, visible: false };
                setTimeout(() => {
                    setItems(previous => previous.filter((item) => item.id !== id));
                }, 500);
                return updatedItem;
            }
            return item;
        }));
    }, []);

    // Handles notifications received and places them into the current state
    const onNotifyReceive = useCallback((data: TNotifyItem) => {
        const { type, message, duration } = data;
        const id = currentId++;

        // Make item invisible
        setItems(previous => [...previous, { id, type, message, visible: false }]);

        // Request a new frame (allow render and transition to sync) and make item visible
        requestAnimationFrame(() => {
            setItems(previous => previous.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, visible: true };
                    setTimeout(() => {
                        notificationRemove(item.id);
                    }, duration || config.notifications.defaultDuration);
                    return updatedItem;
                }
                return item;
            }));
        });
    }, [notificationRemove]);

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
