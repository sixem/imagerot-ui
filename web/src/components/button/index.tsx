




type TButtonProps = {
    disabled: boolean;
    onClick?: (...args: any) => any;
};

export const Button = ({ disabled, onClick }: TButtonProps) => {
    const handlers = {
        onClick: () => { if (onClick) onClick(); },
        onMouseEnter: (e: any) => { console.log('onMouseEnter', e); },
        onMouseLeave: (e: any) => { console.log('onMouseLeave', e); }
    };

    return (
        <div className="button" data-disabled={disabled} {...handlers}>
            <span>Process image</span>
        </div>
    );
};

export const ButtonSet = () => {
    return null;
};
