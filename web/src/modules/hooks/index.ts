import { senders } from './senders';

type TPointer = HTMLElement | Window | Document;

export type TCallback<T = unknown> = { bivarianceHack(arg: T): void }["bivarianceHack"];

type TBound = {
    [key: string]: {
        callbacks: { [key: string]: TCallback<Event>[] };
        handler: TCallback<Event>;
    };
};

type TListen = (params: {
    pointer: TPointer;
    events: string | string[];
    callbacks: TCallback<Event> | TCallback<Event>[];
    identifier: string;
}) => void;

type TTrigger = (params: { trigger: string; data: unknown }) => void;

// Make watch generic so callers can pass strongly-typed payload callbacks
type TWatch = <T = unknown>(params: {
    trigger: string;
    identifier: string;
    callback: TCallback<T>;
}) => void;
type TUnwatch = (params: { trigger: string; identifier: string }) => void;

const listeners: { [key: string]: { pointer: TPointer; bound: TBound } } = {};

// Store watchers as accepting unknown (internal erasure)
const triggers: Record<string, { watchers: Record<string, (arg: unknown) => void> }> = {};

const unlisten = ({ pointer, events, identifier }: Omit<Parameters<TListen>[0], 'callbacks'>) => {
    if (!pointer || !identifier) throw new Error('Missing required parameters for listen hook');
    if (!Array.isArray(events)) events = [events];

    const keys = Object.keys(listeners);
    const key = keys.find(id => listeners[id].pointer === pointer);

    if (!key) return;

    const bound = listeners[key].bound;

    for (const event of events) {
        if (!Object.prototype.hasOwnProperty.call(bound, event)) continue;

        const entry = bound[event];

        if (Object.prototype.hasOwnProperty.call(entry.callbacks, identifier)) {
            delete entry.callbacks[identifier];
        }

        if (Object.keys(entry.callbacks).length === 0) {
            pointer.removeEventListener(event, entry.handler as EventListener, { capture: true });
            delete bound[event];
        }
    }

    if (Object.keys(bound).length === 0) {
        delete listeners[key];
    }
};

const listen: TListen = ({ pointer, events, callbacks, identifier }) => {
    if (!pointer || !callbacks || !identifier) {
        throw new Error('Missing required parameters for listen hook');
    }

    if (!Array.isArray(callbacks)) callbacks = [callbacks];
    if (!Array.isArray(events)) events = [events];

    const keys = Object.keys(listeners);
    const preExistingPointer =
        keys.length > 0 ? keys.filter(id => listeners[id].pointer === pointer) : false;

    if (!preExistingPointer || preExistingPointer.length === 0) {
        const bound: TBound = {};

        for (const event of events) {
            bound[event] = {
                callbacks: { [identifier]: callbacks },
                handler: (e: Event) => {
                    for (const [, value] of Object.entries(bound[event].callbacks)) {
                        for (const callback of value) callback(e);
                    }
                }
            };

            pointer.addEventListener(event, bound[event].handler as EventListener, { capture: true });
        }

        listeners[keys.length] = { pointer, bound };
    } else if (Array.isArray(preExistingPointer)) {
        const id = preExistingPointer[0];

        for (const event of events) {
            if (!Object.prototype.hasOwnProperty.call(listeners[id].bound, event)) {
                listeners[id].bound[event] = {
                    callbacks: { [identifier]: callbacks },
                    handler: (e: Event) => {
                        for (const [, value] of Object.entries(listeners[id].bound[event].callbacks)) {
                            for (const callback of value) callback(e);
                        }
                    }
                };

                pointer.addEventListener(event, listeners[id].bound[event].handler as EventListener, {
                    capture: true
                });
            } else {
                listeners[id].bound[event].callbacks[identifier] = callbacks;
            }
        }
    }
};

const trigger: TTrigger = ({ trigger, data }) => {
    if (!Object.prototype.hasOwnProperty.call(triggers, trigger)) return;
    for (const [, callback] of Object.entries(triggers[trigger].watchers)) callback(data);
};

// Generic implementation; store erased to unknown internally
const watch: TWatch = ({ trigger, identifier, callback }) => {
    if (!Object.prototype.hasOwnProperty.call(triggers, trigger)) triggers[trigger] = { watchers: {} };
    // erase payload type when storing
    triggers[trigger].watchers[identifier] = callback as unknown as (arg: unknown) => void;
};

const unwatch: TUnwatch = ({ trigger, identifier }) => {
    if (!Object.prototype.hasOwnProperty.call(triggers, trigger)) return;
    if (Object.prototype.hasOwnProperty.call(triggers[trigger].watchers, identifier)) {
        delete triggers[trigger].watchers[identifier];
    }

    if (Object.keys(triggers[trigger].watchers).length === 0) {
        delete triggers[trigger];
    }
};

export const hooks = {
    listen,
    unlisten,
    trigger,
    watch,
    unwatch,
    senders
};

export { useTimeouts } from './useTimeouts';
