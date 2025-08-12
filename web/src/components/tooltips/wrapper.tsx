import type { ReactElement, MouseEvent, CSSProperties } from 'react';
import type { TTooltipProps, TTooltipHandlers, TTooltipData } from './types';

import { cloneElement, isValidElement, useEffect } from 'react';
import { hooks, triggers } from '@/modules';

const handlers: TTooltipHandlers = {
    onMouseEnter: (rect, text) => {
        hooks.trigger({
            trigger: triggers.tooltip,
            data: { visible: true, rect, text: text || '' } as TTooltipData,
        });
    },
    onMouseLeave: () => {
        hooks.trigger({ trigger: triggers.tooltip, data: { visible: false } as TTooltipData });
    },
    onClick: () => {
        hooks.trigger({ trigger: triggers.tooltip, data: { visible: false } as TTooltipData });
    },
};

type InjectedHandlers = Pick<
    React.HTMLAttributes<HTMLElement>,
    'onMouseEnter' | 'onMouseLeave' | 'onClick'
>;

export const Tooltip = ({ children, text, indicator = false }: TTooltipProps) => {
    const childProps = isValidElement(children) ? (children.props as Record<string, unknown>) : {};

    const callChild = (event: keyof InjectedHandlers, e: MouseEvent<HTMLElement>) => {
        const maybe = childProps[event] as ((ev: MouseEvent<HTMLElement>) => void) | undefined;
        if (maybe) maybe(e);
    };

    const injected: InjectedHandlers = {
        onMouseEnter: (e) => {
            callChild('onMouseEnter', e);
            handlers.onMouseEnter(e.currentTarget.getBoundingClientRect(), text || '');
        },
        onMouseLeave: (e) => {
            callChild('onMouseLeave', e);
            handlers.onMouseLeave();
        },
        onClick: (e) => {
            callChild('onClick', e);
            handlers.onClick();
        },
    };

    useEffect(() => {
        return () => {
            // Clear lingering tooltips on unmount
            hooks.trigger({ trigger: triggers.tooltip, data: { visible: false } });
        };
    }, []);

    return isValidElement(children)
        ? cloneElement(
            children as ReactElement<{ style?: CSSProperties }>,
            {
                ...injected,
                style: {
                    ...(childProps.style as CSSProperties | undefined),
                    ...(indicator ? { cursor: 'help' } : {}),
                },
            }
        )
        : children;
};
