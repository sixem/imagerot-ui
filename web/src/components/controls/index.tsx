import type { TEffectConfigItem, TEffectItem, TEffectConfigNumber, TModeItem } from '@/data/types';

import { useEffect, useState, useRef, Fragment } from 'react';
import { effects, modes } from '@/data/';
import { Github } from '@/icons/';
import { Config } from '@/config';

import './index.scss';

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

    const event = () => {
        if (selectionRef.current) {
            const value  = selectionRef.current.value;

            if (modes[value]) {
                setSelected(modes[value]);
                onChange(value);
            }
        }
    };

    useEffect(() => event());

    return (
        <div className="section selection-mode">
            <div className="sub-header">Available modes:</div>

            <div className="selection-buttoned">
                <select name="mode-select" ref={selectionRef} onChange={event}>
                    {(Object.keys(modes).map((mode) => {
                        return <option key={mode} value={mode}>{mode}</option>;
                    }))}
                </select>
                <div className="button">Add</div>
            </div>

            <div className="description">
                {selected?.description || "Adds the selected mode to the workflow."}
            </div>
        </div>
    );
};

const RangeInput = ({ name, item }: { name: string; item: TEffectConfigNumber; }) => {
    const [type, min, current, max, f, postfix, description] = item as TEffectConfigNumber;
    const [value, setValue] = useState<number>(current);
    const ref = useRef<HTMLInputElement>(null);

    const onChange = () => {
        if (ref.current) {
            setValue(parseInt(ref.current.value));
        }
    };

    return (
        <Fragment>
            <div key={type}>{name} ({f(value)}{postfix || ''})</div>
            <input type="range" {...{ min, max, value, onChange, ref }} data-actual={f(value)} data-key={name} />
        </Fragment>
    );
};

/**
 * Effect configuration
 */
const SelectionEffectConfig = ({ config }: { config: { [key: string]: TEffectConfigItem } }) => {
    useEffect(() => {
        console.log(config);
    });

    return (
        <div className="configuration">
            {Object.keys(config).map((key) => {
                const effect = config[key];
                const type = effect[0];

                console.log(effect);

                if (type === 'number') {
                    return (
                        <div className="config-item" key={key}>
                            <RangeInput name={key} item={effect} />
                        </div>
                    );
                } else if (type === 'string') {
                    return <div key={key}>{key} string</div>;
                } else if (type === 'color') {
                    return <div key={key}>{key} color</div>;
                }

                return null;
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

    const event = () => {
        if (selectionRef.current) {
            const value = selectionRef.current.value;

            if (effects[value]) {
                setSelected(effects[value]);
                onChange(value);
            }
        }
    };

    useEffect(() => event());

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={event}>
                {(Object.keys(effects).map((key) => {
                    const formated = effects[key]?.format || key;
                    return <option key={key} value={key}>{formated}</option>;
                }))}
            </select>

            <div className="description">
                {selected?.description || "Adds the selected effect to the workflow."}
            </div>

            {selected?.config ? <SelectionEffectConfig config={selected.config} /> : null}

            <div className="button">Add effect to workflow</div>
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
            </div>
            <div className="bottom"></div>
        </div>
    );
};

export { Controls };
