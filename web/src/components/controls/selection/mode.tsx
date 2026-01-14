import type { TModeItem } from '@/data/types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components';
import { Modes } from '@/data/';
import { listModes } from 'imagerot/browser';
import { config } from '@/config';
import { pickDefault } from '@/utils';

const MODE_VALID = new Set(listModes());
const MODE_KEYS = Object.keys(Modes).sort();
const MODE_DEFAULT = pickDefault(
    MODE_KEYS,
    MODE_VALID,
    config?.selections?.defaults?.mode as typeof MODE_KEYS[number] | null | undefined
);

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

export { SelectionMode };
