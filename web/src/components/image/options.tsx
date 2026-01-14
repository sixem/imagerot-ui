import { useState } from 'react';
import { Tooltip } from '@/components/tooltips/';

type TOptionFun = (() => void) | null;

type TOptionsProps = Record<
    'pin' | 'reset' | 'trash' | 'open' | 'save',
    TOptionFun
>;

const Options = ({ pin, reset, open, save, trash }: TOptionsProps) => {
    const [isToggled, setToggled] = useState<boolean>(true);

    return (
        <div className="options">
            {isToggled && pin ? (
                <Tooltip text="Pin the current canvas as the unmodified image">
                    <div onClick={pin} className="file-pin" />
                </Tooltip>
            ) : null}

            {isToggled && reset ? (
                <Tooltip text="Reset the image back to its unmodified state">
                    <div onClick={reset} className="file-reset" />
                </Tooltip>
            ) : null}

            {isToggled && trash ? (
                <Tooltip text="Clear the entire canvas">
                    <div onClick={trash} className="file-trash" />
                </Tooltip>
            ) : null}

            {isToggled && open ? (
                <Tooltip text="Open the image in a new tab or window">
                    <div onClick={open} className="file-open" />
                </Tooltip>
            ) : null}

            {isToggled && save ? (
                <Tooltip text="Export the current canvas">
                    <div onClick={save} className="file-save" />
                </Tooltip>
            ) : null}

            {(pin || reset || open || save || trash) ? (
                <Tooltip text={"Toggle the collapsed state of the toolbar"}>
                    <div onClick={() => setToggled((p) => !p)} className={
                        "file-toggle" + (isToggled ? " expanded" : "")
                    } />
                </Tooltip>
            ) : null}
        </div>
    );
};

export { Options };
