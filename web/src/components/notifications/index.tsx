import type { TNotifyItem } from '@/data/types';

import { useEffect, useState } from 'react';
import { hooks, triggers } from '@/modules';

import './index.scss';

const hookId = {
    APP_NOTIFY_WATCHER: 'app:notify:watcher',
};

// Tracks the current notification item ID
let currentId = 0;

export const Notifications = () => {
    const [items, setItems] = useState<(TNotifyItem & { id: number; visible: boolean; })[]>([]);

    // Handles notifications received and places them into the current state
    const onNotifyReceive = (data: TNotifyItem) => {
        const { type, message, id, duration } = {...data, ...{ id: currentId++ }};

        // Make item invisible
        setItems(previous => [...previous, { id, type, message, visible: false }]);

        // Request a new frame (allow render and transition to sync) and make item visible
        requestAnimationFrame(() => {
            setItems(previous => previous.map((item) => {
                if (item.id === id) {
                    item.visible = true;
                    setTimeout(() => notificationRemove(item.id), duration || 5000);
                }
                return item;
            }));
        });
    };

    // Removes a notification by its ID
    const notificationRemove = (id: number) => {
        setItems(previous => previous.map((item) => {
            if (item.id === id) {
                item.visible = false;

                setTimeout(() => {
                    setItems(previous => previous.filter((item) => item.id !== id));
                }, 500);
            }
            
            return item;
        }));
    };

    useEffect(() => {
        hooks.watch({
            trigger: triggers.notify,
            identifier: hookId.APP_NOTIFY_WATCHER,
            callback: onNotifyReceive
        });

        return () => {
            hooks.unwatch({
                trigger: triggers.notify,
                identifier: hookId.APP_NOTIFY_WATCHER
            });
        }
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
