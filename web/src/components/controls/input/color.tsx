import type { TEffectConfigColor, TInputSignature } from '@/data/types';

import { useEffect, useState, useRef, useCallback } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { debounce } from '@/utils/';

type TColorObject = { r: number; g: number; b: number;};

/** Small helper function that pads a number with zeros */
const pad = (n: number) => n.toString().padStart(3, '0');

/**
 * Color input for color-based effect configurations
 */
export const InputColor = ({ name, item, onChange }: TInputSignature<TEffectConfigColor>) => {
    const [color, setColor] = useState<TColorObject>({
        r: item.current[0],
        g: item.current[1],
        b: item.current[2]
    });

    const [isPicking, setPicking] = useState<boolean>(false);

    const colorRef = useRef<TColorObject>(color);
    const pending  = useRef(false);

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

    return (
        <div className="config-item color-item" key={name}>
            <div title={item.desc} key={item.type} className="flex">

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
