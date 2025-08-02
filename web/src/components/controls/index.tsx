import type { TEffectConfigItem, TEffectItem, TEffectConfigNumber, TModeItem, TEffectValue, TEffectConfigColor, TEffectConfigString } from '@/data/types';

import { useEffect, useState, useRef, useCallback } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { effects, modes } from '@/data/';
import { debounce } from '@/utils/';
import { EffectType } from '@/data/enums';
import { Github } from '@/icons/';
import { Config } from '@/config';

import './index.scss';

const WorkItemType = { Mode: 0, Effect: 1 };

type TEffectChangeEvent = {
    config: { [key: string]: TEffectConfigItem };
    onChange: (name: string, value: TEffectValue) => void;
};

type TInputSignature<TItem = TEffectConfigNumber> = {
    name: string;
    item: TItem;
    onChange: TEffectChangeEvent['onChange']
};

type TWorkItem = {
    key: string;
    type: typeof WorkItemType[keyof typeof WorkItemType];
    config: null | { [key: string]: TEffectValue; };
};

const getDefaultValue = (config: TEffectConfigItem) => {
    const [type, a, b] = config;

    // This is awful, and I hate it.
    // A rewrite of the data structure is needed.
    switch (type) {
        case EffectType.NUMBER : return b;
        case EffectType.COLOR  : return a;
        case EffectType.STRING : return (a as [number, number, number])[0] || null;
        case EffectType.OBJECT : return null;
        default                : return null;
    }
};

/**
 * Sidebar header (top)
 */
const Header = () => {
    return (
        <div className="header">
            <h2>{Config.HEADER_LABEL}</h2>
            <div className="note">
                <span>Check out the project on <a target="_blank" href={Config.HEADER_GIT_URL}>GitHub</a></span>
                <Github />
            </div>
        </div>
    );
};

/**
 * File input
 */
const FileInput = () => {
    return (
        <div className="section file-input">
            <div className="sub-header">File selection:</div>
            <input type="file" accept={Config.ALLOWED_FILETYPES.join(', ')} />
        </div>
    );
};

/**
 * Mode selection
 */
const SelectionMode = ({ onChange }: { onChange: (mode: string) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<TModeItem | null>(null);

    const eventOnChange = () => {
        if (selectionRef.current) {
            const value  = selectionRef.current.value;

            if (modes[value]) {
                setSelected(modes[value]);
                onChange(value);
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
                <div className="button">Add</div>
            </div>

            <div className="description">
                <span>{selected?.description || "Adds the selected mode to the workflow."}</span>
            </div>
        </div>
    );
};

/**
 * Range input for number-based effect configurations
 */
const RangeInput = ({ name, item, onChange }: TInputSignature<TEffectConfigNumber>) => {
    const [type, min, current, max, f, postfix, description] = item as TEffectConfigNumber;
    const [value, setValue] = useState<number>(current);
    const ref = useRef<HTMLInputElement>(null);

    const eventOnChange = () => {
        if (ref.current) {
            const current = parseInt(ref.current.value);

            setValue(current);
            onChange(name, current);
        }
    };

    return (
        <div className="config-item" key={name}>
            <div title={description} key={type}>{name} ({f(value)}{postfix || ''}):</div>
            <input type="range" {...{ min, max, value, onChange: eventOnChange, ref }} />
        </div>
    );
};

/**
 * Color input for color-based effect configurations
 */
const ColorInput = ({ name, item, onChange }: TInputSignature<TEffectConfigColor>) => {
    const [type, current, description] = item as TEffectConfigColor;
    const [color, setColor] = useState({ r: current[0], g: current[1], b: current[2] });
    const [isPicking, setPicking] = useState<boolean>(false);

    const colorRef = useRef(color);
    const pending = useRef(false);
    const debouncedOnChange = useCallback(debounce(onChange, 250), [onChange]);

    useEffect(() => {
        debouncedOnChange(name, [color.r, color.g, color.b]);
        colorRef.current = color;
    }, [color]);

    const handleChange = (updated: { r: number; g: number; b: number }) => {
        colorRef.current = updated;
        
        if (!pending.current) {
            pending.current = true;

            requestAnimationFrame(() => {
                setColor(colorRef.current);
                pending.current = false;
            });
        }
    };

    const pad = (n: number) => n.toString().padStart(3, '0');

    return (
        <div className="config-item color-item" key={name}>
            <div title={description} key={type} className="flex">
                <div className="label">
                    <span>{name} ({`${pad(color.r)}, ${pad(color.g)}, ${pad(color.b)}`}):</span>
                </div>
                <div className="color-indcator" onClick={() => setPicking(!isPicking)}>
                    <div className="bg" style={{
                        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`
                    }} />
                </div>
            </div>
            {isPicking ? <RgbColorPicker color={color} onChange={handleChange} onMouseUp={() => {
                onChange(name, [color.r, color.g, color.b]);
            }} /> : null}
        </div>
    );
};

/**
 * String selection for string-based effect configurations
 */
const StringInput = ({ name, item, onChange }: TInputSignature<TEffectConfigString>) => {
    const [type, values, description] = item as TEffectConfigString;
    const selectRef = useRef<HTMLSelectElement>(null);

    return (
        <div className="config-item" key={name}>
            <div title={description} key={type}>{name}:</div>

            <select ref={selectRef} onChange={() => {
                if (selectRef.current) {
                    onChange(name, selectRef.current.value);
                }
            }}>
                {values.map((value) => {
                    return <option value={value}>{value}</option>;
                })}
            </select>
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
                const effect = config[key];
                const type = effect[0];

                switch (type) {
                    case EffectType.NUMBER: {
                        return <RangeInput key={key} {...{ onChange, name: key }} item={effect as TEffectConfigNumber} />;
                    }

                    case EffectType.STRING: {
                        return <StringInput key={key} {...{ onChange, name: key }} item={effect as TEffectConfigString} />;
                    }

                    case EffectType.COLOR: {
                        return <ColorInput key={key} {...{ onChange, name: key }} item={effect as TEffectConfigColor} />;
                    }

                    default: return null;
                }
            }).filter(_ => _)}
        </div>
    );
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
            setConfig(Object.fromEntries(Object.keys(selected.value.config || {}).map((key) => {
                const value = getDefaultValue((selected.value.config as {
                    [key: string]: TEffectConfigItem;
                })[key]);

                return value !== null ? [key, value] : null;
            }).filter((item): item is [string, TEffectValue] => item !== null)));
        }
    }, [selected]);

    // Enforces automatic initial selection
    useEffect(() => eventOnChange(), []);

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={eventOnChange}>
                {(Object.keys(effects).map((key) => { // Read in available configuration for the effect
                    const formated = effects[key]?.format || key;
                    return <option key={key} value={key}>{formated}</option>;
                }))}
            </select>

            <div className="description">
                <span>{selected?.value?.description || "Adds the selected effect to the workflow."}</span>
            </div>

            {selected?.value?.config ? <SelectionEffectConfig config={selected.value.config} onChange={(name, value) => {
                if (config.hasOwnProperty(name)) {
                    setConfig({...config, [name]: value });
                }
            }} /> : null}

            <div className="button" onClick={() => {
                if (selected) onAdd(selected.key, config);
            }}>Add effect to workflow</div>
        </div>
    );
};

/**
 * Workflow component
 * 
 * Contains the active modes and effects that will be used to process the image
 */
const Workflow = ({ queue }: { queue: TWorkItem[] }) => {
    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            <div className="work-order">
                {queue.map((item, index) => {
                    return (
                        <div key={index} className="work-item">{item.key}</div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Controls container
 * 
 * Contains file inputs, selections of modes and effects and the workflow
 */
const Controls = () => {
    const [queue, setQueue] = useState<TWorkItem[]>([]);

    return (
        <div className="controls">
            <div className="top">
                <Header />
                <FileInput />

                <SelectionMode onChange={(mode) => {
                    console.log("Mode changed", mode);
                }} />

                <SelectionEffect onAdd={(effect, config) => {
                    setQueue([...queue, { type: WorkItemType.Effect, key: effect, config }])
                }} />

                <Workflow {...{ queue }} />
            </div>
            <div className="bottom"></div>
        </div>
    );
};

export { Controls };
