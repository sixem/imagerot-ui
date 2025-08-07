import type { ReactElement, Ref, MouseEvent, CSSProperties } from 'react';
import type { TTooltipProps, TTooltipHandlers, TTooltipData } from './types';

import { cloneElement, isValidElement, useEffect, useRef } from 'react';
import { Hooks, Triggers } from '@/modules';

// Handlers to attach to the <Tooltip /> child
const handlers: TTooltipHandlers = {
    onMouseEnter: (rect, text) => {
        Hooks.trigger({
            trigger: Triggers.TOOLTIP,
            data: { visible: true, rect, text: (text || "") } as TTooltipData
        });
    },
    onMouseLeave: () => {
        Hooks.trigger({
            trigger: Triggers.TOOLTIP,
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
            Hooks.trigger({ trigger: Triggers.TOOLTIP, data: { visible: false } });
        };
    }, [])

return isValidElement(children)
    ? cloneElement(children as ReactElement<{ ref?: Ref<HTMLElement>; style: CSSProperties }>, {
        ref: setAnchorRef, ...propsCurrent, style: {
            ...(propsChildren.style || {}), ...(indicator ? { cursor: 'help' } : {})
        }
    })
    : children;
};