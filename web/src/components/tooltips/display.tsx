import type { TTooltipData, TTooltipInset } from './types';

import { Config } from '@/config';
import { Hooks, Triggers } from '@/modules';
import { useEffect, useState, useRef } from 'react';

import './display.scss';

const hookProps = { trigger: Triggers.TOOLTIP, identifier: 'tooltip:watcher' };

/**
 * Calculates the inset placement of the tooltip given a DOMRect
 */
const calculateInset = (rect: DOMRect, margin: number = 5): TTooltipInset => {
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const inset: TTooltipInset = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };

    // Calculate horizontal alignment
    if (rect.x <= (viewport.width / 2)) {
        inset.left = (rect.x + margin) + 'px';
    } else {
        inset.right = Math.max(0, viewport.width - rect.x - rect.width + margin) + 'px';
    }

    // Calculate vertical alignment
    inset.top = rect.y <= (viewport.height / 2)
        ? (rect.y + margin + rect.height) + 'px'
        : Math.max(0, rect.y - rect.height) + 'px';

    return inset;
};

export const TooltipDisplay = () => {
    const [isVisible, setVisible] = useState<boolean>(false);
    const [currentText, setText] = useState<string>("");
    const [currentInset, setInset] = useState<TTooltipInset | null>(null);

    const timerRef = useRef<any>(null);

    useEffect(() => {
        Hooks.watch({
            ...hookProps,
            callback: (data: TTooltipData) => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                if (data.visible && data.text) {
                    // Update tooltip data
                    setInset(calculateInset(data.rect));
                    setText(data.text);

                    // Make it visible with n delay (ms)
                    timerRef.current = setTimeout(() => setVisible(true), Config.tooltips.delay);
                } else {
                    setText("");
                    setVisible(false);
                }
            }
        });

        return () => { Hooks.unwatch(hookProps); }
    }, []);

    return (
        <div className="tooltip-display" data-visible={isVisible} style={{
            ...(currentInset || {})
        }}>
            <span>{currentText}</span>
        </div>
    );
};
