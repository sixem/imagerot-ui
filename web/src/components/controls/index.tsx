import type {
    TEffectConfigItem,
    TEffectItem,
    TEffectConfigNumber,
    TEffectValue,
    TEffectConfigColor,
    TEffectConfigString,
    TEffectChangeEvent,
    TPaneSignature,
    TModeItem,
    TWorkItem
} from '@/data/types';

import { useEffect, useState, useRef } from 'react';
import { InputString, InputRange, InputColor, InputFile } from './input/';
import { Actions } from './actions';
import { Workflow } from './workflow';
import { Effects, Modes } from '@/data/';
import { EffectType, WorkItemType } from '@/data/enums';
import { Github } from '@/icons/';
import { listEffects, listModes } from 'imagerot/browser';

import './index.scss';

/** Get valid modes and effects for our current version */
const validEffects = Object.fromEntries(listEffects().map((key) => [key, true]));
const validModes = Object.fromEntries(listModes().map((key) => [key, true]));

const getDefaultValue = (config: TEffectConfigItem) => {
    const [type, a, b,, f] = config;

    switch (type) {
        case EffectType.NUMBER : return f ? f(b as number) : b;
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
                <span>Check out the <a target="_blank" href="https://github.com/sixem/imagerot-ui/">project on GitHub</a></span>
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

            if (Modes[value]) {
                setSelected({ key: value, details: Modes[value] });
            }
        }
    };

    useEffect(() => eventOnChange(), []);

    return (
        <div className="section selection-mode">
            <div className="sub-header">Available modes:</div>

            <div className="selection-buttoned">
                <select name="mode-select" ref={selectionRef} onChange={eventOnChange}>
                    {(Object.keys(Modes).sort().map((key) => {
                        return validModes[key] ? (
                            <option key={key} value={key}>{key}</option>
                        ) : null;
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

            if (Effects[value]) {
                setSelected({ key: value, value: Effects[value] });
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
                {(Object.keys(Effects).sort().map((key) => { // Read in available configuration for the effect
                    return validEffects[key] ? (
                        <option key={key} value={key}>{Effects[key]?.format || key}</option>
                    ) : null;
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
const Controls = ({ current, setters, busy }: TPaneSignature) => {
    const [workflow, setWorkflow] = useState<TWorkItem[]>([]);

    return (
        <div className="controls">
            <div className="top">
                <Header />
                
                <div className="section">
                    <InputFile setter={setters.file} />
                </div>

                <SelectionMode onAdd={(mode, _) => {
                    setWorkflow(previous => [...previous, {
                        type: WorkItemType.MODE,
                        id: workItemId++,
                        key: mode,
                        config: null,
                        muted: false
                    }]);
                }} />

                <SelectionEffect onAdd={(effect, config) => {
                    setWorkflow((previous) => [...previous, {
                        type: WorkItemType.EFFECT,
                        id: workItemId++,
                        key: effect,
                        config: config,
                        muted: false
                    }]);
                }} />

                <Workflow {...{ workflow, setWorkflow }} />
            </div>
            <div className="bottom">
                <Actions {...{ current, setters, busy }} workflow={workflow} />
            </div>
        </div>
    );
};

export { Controls };
