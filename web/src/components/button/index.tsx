import type { CSSProperties } from 'react';

import './index.scss';

type TButtonProps = {
    text: string | null;
    disabled?: boolean;
    onClick?: () => void;
    style?: CSSProperties | null;
    icon?: string;
};

type TButtonSetProps = {
    items: TButtonProps[];
    style?: CSSProperties | null;
}

export const Button = ({ text, style, onClick, icon, disabled = false }: TButtonProps) => {
    const classList = ['button'];

    if (icon) {
        classList.push('icon ' + icon);

        if (text === null) {
            classList.push('textless');
        }
    }

    return (
        <div className={classList.join(' ')} data-disabled={disabled} onClick={() => {
            if (!disabled && typeof onClick === 'function') {
                onClick();
            }
        }} style={style || {}}>
            {text === null ? null : (<span>{text}</span>)}
        </div>
    );
};

export const ButtonSet = ({ items, style = {} }: TButtonSetProps) => {
    return (
        <div className="button-set" style={style || {}}>
            {items.map((item, index) => {
                return <Button key={index} {...item} />;
            })}
        </div>
    );
};
