import type { TTooltipData, TTooltipInset } from './types';

import { config } from '@/config';
import { hooks, triggers } from '@/modules';
import { useEffect, useState, useRef } from 'react';

import './display.scss';

const hookProps = { trigger: triggers.tooltip, identifier: 'tooltip:watcher' };

/**
 * Calculates the inset placement of the tooltip given a DOMRect
 */
const calculateInset = (rect: DOMRect, margin: number = 5): TTooltipInset => {
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const inset: TTooltipInset = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };

    // Calculate horizontal alignment
    if (rect.left <= (viewport.width / 2)) {
        inset.left = (rect.left + margin) + 'px';
    } else {
        inset.right = Math.max(0, viewport.width - rect.left - rect.width + margin) + 'px';
    }

    // Calculate vertical alignment
    inset.top = rect.top <= (viewport.height / 2)
        ? (rect.top + margin + rect.height) + 'px'
        : Math.max(0, rect.top - rect.height - margin) + 'px';

    return inset;
};

export const TooltipDisplay = () => {
    const [isVisible, setVisible] = useState<boolean>(false);
    const [currentText, setText] = useState<string>("");
    const [currentInset, setInset] = useState<TTooltipInset | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        hooks.watch({
            ...hookProps,
            callback: (data: TTooltipData) => {
                if (timerRef.current !== null) {
                    clearTimeout(timerRef.current);
                }

                if (data.visible && data.text) {
                    // Update tooltip data
                    setInset(calculateInset(data.rect));
                    setText(data.text);

                    // Make it visible with n delay (ms)
                    timerRef.current = setTimeout(() => setVisible(true), config.tooltips.delay);
                } else {
                    setText("");
                    setVisible(false);
                }
            }
        });

        return () => {
            hooks.unwatch(hookProps);
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        }
    }, []);

    return (
        <div className="tooltip-display" data-visible={isVisible} style={{
            ...(currentInset || {})
        }}>
            <span>{currentText}</span>
        </div>
    );
};
