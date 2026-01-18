import type { TEffectConfigColor, TInputSignature } from '@/data/types';

import { useEffect, useState, useRef, useMemo } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { debounce } from '@/utils/';
import { Tooltip } from '@/components/tooltips';

type TColorObject = { r: number; g: number; b: number;};

/** Small helper function that pads a number with zeros */
const pad = (n: number) => n.toString().padStart(3, '0');

/**
 * Color input for color-based effect configurations
 */
export const InputColor = ({
    name,
    item,
    onChange,
    value
}: TInputSignature<TEffectConfigColor, [number, number, number]>) => {
    const [color, setColor] = useState<TColorObject>({
        r: item.current[0],
        g: item.current[1],
        b: item.current[2]
    });

    const [isPicking, setPicking] = useState<boolean>(false);

    const pendingRef = useRef(false);
    const syncTargetRef = useRef<TColorObject | null>(null);
    const colorRef = useRef<TColorObject>(color);
    const nameRef = useRef(name);

    const debouncedOnChange = useMemo(() => debounce(onChange, 250), [onChange]);

    useEffect(() => { nameRef.current = name;}, [name]);

    useEffect(() => {
        const nextColor = Array.isArray(value) && value.length === 3
            ? { r: value[0], g: value[1], b: value[2] }
            : { r: item.current[0], g: item.current[1], b: item.current[2] };

        syncTargetRef.current = nextColor;
        setColor(nextColor);
    }, [item, value]);

    useEffect(() => {
        // Avoid re-firing onChange when syncing external values into local state.
        if (syncTargetRef.current) {
            if (
                color.r === syncTargetRef.current.r
                && color.g === syncTargetRef.current.g
                && color.b === syncTargetRef.current.b
            ) {
                syncTargetRef.current = null;
            }
            colorRef.current = color;
            return;
        }

        debouncedOnChange(nameRef.current, [color.r, color.g, color.b]);
        colorRef.current = color;
    }, [color, debouncedOnChange]);

    const handleChange = (updated: { r: number; g: number; b: number }) => {
        colorRef.current = updated;
        
        if (!pendingRef.current) {
            pendingRef.current = true;

            requestAnimationFrame(() => {
                setColor(colorRef.current);
                pendingRef.current = false;
            });
        }
    };

    return (
        <div className="config-item color-item" key={name}>
            <div key={item.type} className="flex">

                <div className="label">
                    <Tooltip text={item.desc || ""}>
                        <span>{name} ({`${pad(color.r)}, ${pad(color.g)}, ${pad(color.b)}`}):</span>
                    </Tooltip>
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
