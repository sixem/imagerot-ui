import type {
    TEffectConfigItem,
    TEffectItem,
    TEffectConfigNumber,
    TEffectValue,
    TEffectConfigColor,
    TEffectConfigString,
    TPaneSignature,
    TModeItem,
} from '@/data/types';

import { useEffect, useState, useRef } from 'react';
import { InputString, InputRange, InputColor, InputFile } from './input/';
import { Workflow } from './workflow';
import { effects, modes } from '@/data/';
import { EffectType } from '@/data/enums';
import { Github } from '@/icons/';

import './index.scss';

/** Valid work item types */
export const WorkItemType = { Mode: 0, Effect: 1 };

export type TEffectChangeEvent = {
    config: { [key: string]: TEffectConfigItem };
    onChange: (name: string, value: TEffectValue) => void;
};

export type TInputSignature<TItem = TEffectConfigNumber> = {
    name: string;
    item: TItem;
    onChange: TEffectChangeEvent['onChange']
};

export type TWorkItem = {
    key: string;
    type: typeof WorkItemType[keyof typeof WorkItemType];
    config: null | { [key: string]: TEffectValue; };
    id: number;
};

const getDefaultValue = (config: TEffectConfigItem) => {
    const [type, a, b] = config;

    // This is awful, and I hate it.
    // A rewrite of the data structure is needed.
    switch (type) {
        case EffectType.NUMBER : return b;
        case EffectType.COLOR  : return a;
        case EffectType.STRING : return (a as [number, number, number])[0] || null;
        case EffectType.OBJECT : return null; // Needs support!
        default                : return null;
    }
};

/**
 * Sidebar header (top)
 */
const Header = () => {
    return (
        <div className="header">
            <h2>ImageRot UI</h2>
            <div className="note">
                <span>Check out the project on <a target="_blank" href="https://github.com/sixem/imagerot-ui/">GitHub</a></span>
                <Github />
            </div>
        </div>
    );
};

/**
 * Mode selection
 */
const SelectionMode = ({ onAdd }: { onAdd: (mode: string, details: TModeItem) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<{ key: string; details: TModeItem; } | null>(null);

    const eventOnChange = () => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (modes[value]) {
                setSelected({ key: value, details: modes[value] });
            }
        }
    };

    useEffect(() => eventOnChange(), []);

    return (
        <div className="section selection-mode">
            <div className="sub-header">Available modes:</div>

            <div className="selection-buttoned">
                <select name="mode-select" ref={selectionRef} onChange={eventOnChange}>
                    {(Object.keys(modes).map((mode) => {
                        return <option key={mode} value={mode}>{mode}</option>;
                    }))}
                </select>
                <div className="button" onClick={() => {
                    if (selected) onAdd(selected.key, selected.details);
                }}>Add</div>
            </div>

            <div className="description">
                <span>{selected?.details?.description || "Adds the selected mode to the workflow."}</span>
            </div>
        </div>
    );
};

/**
 * Effect configuration
 */
const SelectionEffectConfig = ({ config, onChange }: TEffectChangeEvent) => {
    return (
        <div className="configuration">
            {Object.keys(config).map((key) => {
                const [type] = config[key];

                switch (type) {
                    case EffectType.NUMBER: {
                        return <InputRange key={key} {...{ onChange, name: key }} item={config[key] as TEffectConfigNumber} />;
                    }

                    case EffectType.STRING: {
                        return <InputString key={key} {...{ onChange, name: key }} item={config[key] as TEffectConfigString} />;
                    }

                    case EffectType.COLOR: {
                        return <InputColor key={key} {...{ onChange, name: key }} item={config[key] as TEffectConfigColor} />;
                    }

                    default: return null;
                }
            }).filter(_ => _)}
        </div>
    );
};

/**
 * Reads in the default configuration values from an object of `TEffectConfigItem` values
 */
const readConfigDefaults = (config: { [key: string]: TEffectConfigItem; }) => {
    return Object.fromEntries(Object.keys(config || {}).map((key) => {
        const value = getDefaultValue((config as {
            [key: string]: TEffectConfigItem;
        })[key]);

        return value !== null ? [key, value] : null;
    }).filter((item): item is [string, TEffectValue] => item !== null));
};

/**
 * Effect selection
 */
const SelectionEffect = ({ onAdd }: { onAdd: (effect: string, config: { [key: string]: TEffectValue }) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<{ key: string; value: TEffectItem; } | null>(null);
    const [config, setConfig] = useState<{ [key: string]: TEffectValue }>({});

    const eventOnChange = () => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (effects[value]) {
                setSelected({ key: value, value: effects[value] });
            }
        }
    };

    useEffect(() => {
        if (selected?.value?.config) {
            // Read in configuration defaults and set as config state
            setConfig(readConfigDefaults(selected.value.config));
        }
    }, [selected]);

    // Enforces automatic initial selection
    useEffect(() => eventOnChange(), []);

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={eventOnChange}>
                {(Object.keys(effects).map((key) => { // Read in available configuration for the effect
                    return <option key={key} value={key}>{effects[key]?.format || key}</option>;
                }))}
            </select>

            <div className="description">
                <span>{selected?.value?.description || "Adds the selected effect to the workflow."}</span>
            </div>

            {selected?.value?.config ? <SelectionEffectConfig config={selected.value.config} onChange={(name, value) => {
                // On any input changes, update the config with the set value
                if (selected?.value?.config?.hasOwnProperty(name)) { // Validating config key can't hurt
                    setConfig(previous => ({...previous, [name]: value }));
                }
            }} /> : null}

            <div className="button" onClick={() => {
                if (selected) onAdd(selected.key, config);
            }}>Add effect to workflow</div>
        </div>
    );
};

let workItemId = 0;

/**
 * Controls container
 * 
 * Contains file inputs, selections of modes and effects and the workflow
 */
const Controls = ({ currentFile, setFile }: TPaneSignature) => {
    const [queue, setQueue] = useState<TWorkItem[]>([]);

    // Handle image processing here somewhere. Remember background workers!
    // currentFile gets us the current image that we're handling, and then we
    // update it using setFile after it has processed.

    return (
        <div className="controls">
            <div className="top">
                <Header />
                
                <InputFile setFile={setFile}/>

                <SelectionMode onAdd={(mode, _) => {
                    setQueue(previous => [...previous, {
                        type: WorkItemType.Mode, id: workItemId++, key: mode, config: null
                    }]);
                }} />

                <SelectionEffect onAdd={(effect, config) => {
                    setQueue(previous => [...previous, {
                        type: WorkItemType.Effect, id: workItemId++, key: effect, config
                    }]);
                }} />

                <Workflow {...{ queue, updater: setQueue }} />
            </div>
            <div className="bottom"></div>
        </div>
    );
};

export { Controls };
