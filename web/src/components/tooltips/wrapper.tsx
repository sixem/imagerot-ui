import type { ReactElement, Ref, MouseEvent, CSSProperties } from 'react';
import type { TTooltipProps, TTooltipHandlers, TTooltipData } from './types';

import { cloneElement, isValidElement, useEffect, useRef } from 'react';
import { hooks, triggers } from '@/modules';

// Handlers to attach to the <Tooltip /> child
const handlers: TTooltipHandlers = {
    onMouseEnter: (rect, text) => {
        hooks.trigger({
            trigger: triggers.tooltip,
            data: { visible: true, rect, text: (text || "") } as TTooltipData
        });
    },
    onMouseLeave: () => {
        hooks.trigger({
            trigger: triggers.tooltip,
            data: { visible: false } as TTooltipData
        });
    },
    onClick: () => {
        hooks.trigger({
            trigger: triggers.tooltip,
            data: { visible: false } as TTooltipData
        });
    }
};

export const Tooltip = ({ children, text, indicator = false }: TTooltipProps) => {
    const propsChildren = (children as any).props || {};
    const anchorRef = useRef<HTMLElement | null>(null);

    const setAnchorRef = (element: HTMLElement | null) => {
        const childRef = (children as any).ref as Ref<HTMLElement> | undefined;
        anchorRef.current = element;

        if (typeof childRef === 'function') {
            childRef(element);
        } else if (childRef) {
            (childRef as any).current = element;
        }
    };

    const propsCurrent = Object.fromEntries(
        Object.entries(handlers).map(([event, handler]) => [
            event, (e: MouseEvent<HTMLElement, MouseEvent>) => {
                if (propsChildren[event]) propsChildren[event](e);

                if (anchorRef.current) {
                    const rect = anchorRef.current.getBoundingClientRect();
                    handler(rect, text || '');
                }
            }
        ])
    );

    useEffect(() => {
        return () => { // Clear any lingering tooltips on unmount
            hooks.trigger({ trigger: triggers.tooltip, data: { visible: false } });
        };
    }, []);

    return isValidElement(children)
        ? cloneElement(children as ReactElement<{ ref?: Ref<HTMLElement>; style: CSSProperties }>, {
            ref: setAnchorRef, ...propsCurrent, style: {
                ...(propsChildren.style || {}), ...(indicator ? { cursor: 'help' } : {})
            }
        }) : children;
};