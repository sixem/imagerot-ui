import type { ReactNode } from 'react';

import { useEffect } from 'react';

import './index.scss';

type TModalProps = {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    className?: string;
};

const Modal = ({ visible, title, onClose, children, className }: TModalProps) => {
    useEffect(() => {
        if (!visible) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div className="modal-backdrop" onMouseDown={(event) => {
            event.stopPropagation();
            onClose();
        }}>
            <div
                className={`modal ${className ?? ''}`.trim()}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="title">{title}</div>
                    <div className="close" onClick={onClose} />
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export type { TModalProps };
export { Modal };
