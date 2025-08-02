import type { TEffectConfigItem, TEffectItem, TEffectConfigNumber, TModeItem, TEffectValue } from '@/data/types';

import { useEffect, useState, useRef, Fragment } from 'react';
import { effects, modes } from '@/data/';
import { EffectType } from '@/data/enums';
import { Github } from '@/icons/';
import { Config } from '@/config';

import './index.scss';

const getDefaultValue = (config: TEffectConfigItem) => {
    const [type, a, b] = config;

    switch (type) {
        case EffectType.NUMBER : return b;
        case EffectType.COLOR  : return a;
        case EffectType.STRING : return (a as [number, number, number])[0] || null;
        case EffectType.OBJECT : return null;
        default       : return null;
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

    useEffect(() => eventOnChange());

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

type TEffectChangeEvent = {
    config: { [key: string]: TEffectConfigItem };
    onChange: (name: string, value: TEffectValue) => void;
};

/**
 * Range input for number-based effect configurations
 */
const RangeInput = ({ name, item, onChange }: {
    name: string;
    item: TEffectConfigNumber;
    onChange: TEffectChangeEvent['onChange']
}) => {
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
        <Fragment>
            <div title={description} key={type}>{name} ({f(value)}{postfix || ''}):</div>
            <input type="range" {...{ min, max, value, onChange: eventOnChange, ref }} />
        </Fragment>
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
                        return (
                            <div className="config-item" key={key}>
                                <RangeInput name={key} {...{ onChange }} item={effect as TEffectConfigNumber} />
                            </div>
                        );
                    }

                    case EffectType.STRING: {
                        return <div key={key}>{key} string</div>;
                    }

                    case EffectType.COLOR: {
                        return <div key={key}>{key} color</div>;
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
const SelectionEffect = ({ onChange }: { onChange: (effect: string) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<TEffectItem | null>(null);
    const [config, setConfig] = useState<{ [key: string]: TEffectValue }>({});

    const effectAdd = () => {
        console.debug("Current config for this effect:", config);
    };

    const eventOnChange = () => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (effects[value]) {
                setSelected(effects[value]);
                onChange(value);
            }
        }
    };

    useEffect(() => {
        if (selected?.config) {
            // Read in configuration defaults and set as config state
            setConfig(Object.fromEntries(Object.keys(selected.config || {}).map((key) => {
                const value = getDefaultValue((selected.config as {
                    [key: string]: TEffectConfigItem;
                })[key]);

                return value !== null ? [key, value] : null;
            }).filter((item): item is [string, TEffectValue] => item !== null)));
        }
    }, [selected]);

    // Enforces automatic initial selection
    useEffect(() => eventOnChange());

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
                <span>{selected?.description || "Adds the selected effect to the workflow."}</span>
            </div>

            {selected?.config ? <SelectionEffectConfig config={selected.config} onChange={(name, value) => {
                // Needs a debounce!
                if (config.hasOwnProperty(name)) {
                    setConfig({...config, [name]: value });
                }
            }} /> : null}

            <div className="button" onClick={effectAdd}>Add effect to workflow</div>
        </div>
    );
};

/**
 * Workflow component
 * 
 * Contains the active modes and effects that will be used to process the image
 */
const Workflow = () => {
    return (
        <div className="section workflow">
            <div className="sub-header">Active workflow items:</div>
            <div className="work-order">

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
    return (
        <div className="controls">
            <div className="top">
                <Header />
                <FileInput />

                <SelectionMode onChange={(mode) => {
                    console.log("Mode changed", mode);
                }} />

                <SelectionEffect onChange={(effect) => {
                    console.log("Effect changed", effect);
                }} />

                <Workflow />
            </div>
            <div className="bottom"></div>
        </div>
    );
};

export { Controls };
