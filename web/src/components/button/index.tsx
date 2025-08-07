import type { CSSProperties } from 'react';

import './index.scss';

type TButtonProps = {
    text: string;
    disabled?: boolean;
    onClick?: (...args: any) => any;
    style?: CSSProperties;
};

type TButtonSetProps = {
    items: TButtonProps[];
    style?: CSSProperties | null;
}

export const Button = ({ text, style, onClick, disabled = false }: TButtonProps) => {
    return (
        <div className="button" data-disabled={disabled} onClick={() => {
            if (typeof onClick === 'function') {
                onClick();
            }
        }} style={style || {}}>
            <span>{text}</span>
        </div>
    );
};

export const ButtonSet = ({ items, style = {} }: TButtonSetProps) => {
    return (
        <div className="button-set" style={style || {}}>
            {items.map((item, index) => {
                return <Button key={index} {...(({ style, ...rest }) => rest)(item)} />;
            })}
        </div>
    );
};
