import type {
    TEffectConfigItem,
    TEffectItem,
    TEffectValue,
    TEffectChangeEvent,
    TPaneSignature,
    TModeItem,
    TWorkItem
} from '@/data/types';

import { useEffect, useState, useRef, Fragment, useCallback, memo } from 'react';
import { InputString, InputRange, InputColor, InputFile } from './input/';
import { Actions } from './actions';
import { Workflow } from './workflow';
import { Effects, Modes } from '@/data/';
import { Button } from '@/components';
import { EffectType, WorkItemType } from '@/data/enums';
import { Github } from '@/icons/';
import { listEffects, listModes } from 'imagerot/browser';

import './index.scss';

type TWorkItemCreator = (
    key: string,
    type: (typeof WorkItemType)[keyof typeof WorkItemType],
    config: { [key: string]: TEffectValue; } | null
) => TWorkItem;

/** Get valid modes and effects for our current version */
const EFFECT_VALID = new Set(listEffects());
const MODE_VALID   = new Set(listModes());

/** Get the active UI effects and modes and sort them */
const EFFECT_KEYS = Object.keys(Effects).sort();
const MODE_KEYS   = Object.keys(Modes).sort();

/** Get our default selections */
const MODE_DEFAULT   = MODE_KEYS.find((k) => MODE_VALID.has(k)) ?? '';
const EFFECT_DEFAULT = EFFECT_KEYS.find((k) => EFFECT_VALID.has(k)) ?? '';

const getDefaultValue = (config: TEffectConfigItem): TEffectValue | null => {
    switch (config.type) {
        case EffectType.number:
            return config.f(config.current);
        case EffectType.color:
            return config.current;
        case EffectType.string:
            return config.values.length > 0 ? config.values[0] : null;
        default:
            return null;
    }
};

/**
 * Sidebar header
 */
const Header = () => {
    return (
        <div className="header">
            <h2>ImageRot UI</h2>
            <div className="note">
                <span>Check out the <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://github.com/sixem/imagerot-ui/"
                >
                    <span>project on GitHub</span>
                </a></span><Github />
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

    const handleModeChange = useCallback(() => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (Modes[value]) {
                setSelected({ key: value, details: Modes[value] });
            }
        }
    }, []);

    useEffect(() => handleModeChange(), [handleModeChange]);

    return (
        <div className="section selection-mode">
            <div className="sub-header">Available modes:</div>

            <div className="selection-buttoned">
                <select name="mode-select" ref={selectionRef} onChange={handleModeChange} value={selected?.key ?? MODE_DEFAULT}>
                    {(MODE_KEYS.map((key) => {
                        return MODE_VALID.has(key) ? (
                            <option key={key} value={key}>{key}</option>
                        ) : null;
                    }))}
                </select>

                <Button text={"Add"} onClick={() => {
                    if (selected) {
                        onAdd(selected.key, selected.details);
                    }
                }} />
            </div>

            <div className="description">
                <span>{selected?.details?.description ?? "Adds the selected mode to the workflow."}</span>
            </div>
        </div>
    );
};

/**
 * Effect configuration
 */
const SelectionEffectConfig = memo(({ config, onChange, path = [] }: TEffectChangeEvent & { path?: string[] }) => {
    return (
        <Fragment>
            {Object.entries(config).map(([key, item]) => {
                const full = [...path, key];
                const name = full.join('.');

                switch (item.type) {
                    case EffectType.number: {
                        return <InputRange key={name} {...{ onChange, name }} item={item} />;
                    };

                    case EffectType.string: {
                        return <InputString key={name} {...{ onChange, name }} item={item} />;
                    };

                    case EffectType.color: {
                        return <InputColor key={name} {...{ onChange, name }} item={item} />;
                    };

                    case EffectType.object: {
                        return (
                            <div className="config-set" key={name}>
                                <SelectionEffectConfig
                                    config={item.values}
                                    onChange={onChange}
                                    path={full}
                                />
                            </div>
                        );
                    }
                }
            })}
        </Fragment>
    );
});

/**
 * Reads in the default configuration values and FLATTENS them using dot-keys.
 */
const readConfigDefaults = (config: { [key: string]: TEffectConfigItem; }) => {
    const out: { [key: string]: TEffectValue } = {};

    const walk = (node: { [key: string]: TEffectConfigItem }, p: string[]) => {
        for (const [k, item] of Object.entries(node || {})) {
            const full = [...p, k];
            const name = full.join('.');

            switch (item.type) {
                case EffectType.object: {
                    walk(item.values, full);
                    break;
                }
                case EffectType.number:
                case EffectType.string:
                case EffectType.color: {
                    const value = getDefaultValue(item);
                    if (value !== null) {
                        out[name] = value as TEffectValue;
                    } break;
                }
            }
        }
    };

    walk(config || {}, []);

    return out;
};

/**
 * Effect selection
 */
const SelectionEffect = ({ onAdd }: { onAdd: (effect: string, config: { [key: string]: TEffectValue }) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);

    const [selected, setSelected] = useState<{ key: string; value: TEffectItem; } | null>(null);
    const [config, setConfig]     = useState<{ [key: string]: TEffectValue }>({});

    const handleConfigChange = useCallback((name: string, value: TEffectValue) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEffectChange = useCallback(() => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (Effects[value]) {
                setSelected({ key: value, value: Effects[value] });
            }
        }
    }, []);

    useEffect(() => {
        if (selected?.value?.config) {
            setConfig(readConfigDefaults(selected.value.config));
        } else {
            setConfig({});
        }
    }, [selected]);

    // Enforces automatic initial selection
    useEffect(() => handleEffectChange(), [handleEffectChange]);

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={handleEffectChange} value={selected?.key ?? EFFECT_DEFAULT}>
                {(EFFECT_KEYS.map((key) => {
                    return EFFECT_VALID.has(key) ? (
                        <option key={key} value={key}>{Effects[key]?.format || key}</option>
                    ) : null;
                }))}
            </select>

            <div className="description">
                <span>{selected?.value?.description ?? "Adds the selected effect to the workflow."}</span>
            </div>

            {selected?.value?.config ? (
                <div className="configuration">
                    <SelectionEffectConfig
                        config={selected.value.config}
                        onChange={handleConfigChange}
                    />
                </div>
            ) : null}

            <Button text={"Add effect to workflow"} icon={"add"} onClick={() => {
                if (selected) {
                    onAdd(selected.key, config);
                }
            }} />
        </div>
    );
};

let workItemId = 0;

/**
 * Creates a simple work item object
 */
const createWorkItem: TWorkItemCreator = (key, type, config) => {
    return { key, config, type, id: workItemId++, muted: false };
};

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
                    setWorkflow(previous => [...previous, createWorkItem(
                        mode, WorkItemType.mode, null
                    )]);
                }} />

                <SelectionEffect onAdd={(effect, config) => {
                    setWorkflow((previous) => [...previous, createWorkItem(
                        effect, WorkItemType.effect, config
                    )]);
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
