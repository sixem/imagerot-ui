import type { TEffectConfigItem } from '@/data/types';

import { useEffect, useState, useRef } from 'react';
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
const SelectionMode = ({ onChange }: { onChange: (string) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<string | null>(null);

    const event = () => {
        if (selectionRef.current) {
            setSelected(selectionRef.current.value);
            onChange(selectionRef.current.value);
        }
    };

    useEffect(() => event());

    return (
        <div className="section selection-mode">
            <div className="sub-header">Available modes:</div>

            <div className="selection-buttoned">
                <select name="mode-select" ref={selectionRef} onChange={event}>
                    {(Object.keys(modes).map((mode, index) => {
                        return <option key={mode} value={mode}>{mode}</option>;
                    }))}
                </select>
                <div className="button">Add</div>
            </div>

            <div className="description">
                {modes[selected]?.description || "Adds the selected mode to the workflow."}
            </div>
        </div>
    );
};

const RnageInput = () => {
    return (
        <input type="range" min="0" max="100" value="7" data-actual="0.07" data-key="quality"></input>
    );
};

/**
 * Effect configuration
 */
const SelectionEffectConfig = ({ config }: { config: TEffectConfigItem }) => {
    useEffect(() => {
        console.log(config);
    });

    return (
        <div className="configuration">
            {Object.keys(config).map((key) => {
                const item = config[key];

                return <div key={key}>{key}</div>
            })}
        </div>
    );
};

/**
 * Effect selection
 */
const SelectionEffect = ({ onChange }: { onChange: (string) => void; }) => {
    const selectionRef = useRef<HTMLSelectElement>(null);
    const [selected, setSelected] = useState<object | null>(null);

    const event = () => {
        if (selectionRef.current) {
            const value  = selectionRef.current.value;

            if (effects[value]) {
                setSelected(effects[value]);
                onChange(selectionRef.current.value);
            }
        }
    };

    useEffect(() => event());

    return (
        <div className="section selection-effect">
            <div className="sub-header">Available effects:</div>

            <select name="effect-select" ref={selectionRef} onChange={event}>
                {(Object.keys(effects).map((key, index) => {
                    const formated = effects[key]?.format || key;
                    return <option key={key} value={key}>{formated}</option>;
                }))}
            </select>

            <div className="description">
                {effects[selected]?.description || "Adds the selected effect to the workflow."}
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
