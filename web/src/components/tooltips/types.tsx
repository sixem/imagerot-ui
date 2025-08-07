import type { ReactElement } from 'react';

export type TTooltipProps = {
    children: ReactElement<any>;
    text: string;
    indicator?: boolean;
};

export type TTooltipHandlers = {
    onMouseEnter: (rect: DOMRect, text: string) => void;
    onMouseLeave: () => void;
};

export type TTooltipPosition = {
    x: number;
    y: number;
};

export type TTooltipInset = {
    top: string;
    right: string;
    bottom: string;
    left: string;
};

export type TTooltipData = {
    visible: true;
    rect: DOMRect;
    text: string;
} | {
    visible: false;
};
