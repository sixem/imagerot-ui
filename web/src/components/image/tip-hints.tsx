import { useEffect, useRef, useState } from 'react';

const tipHints = [
    'you can click and hold the image to see a zoomed view',
    'you can reverse the UI using the reverse button',
    'you can drag to reorder effects and modes'
];

const TipHints = () => {
    const [tipIndex, setTipIndex] = useState(0);
    const [isTipVisible, setTipVisible] = useState(true);
    const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const fadeMs = 1000;
        const holdMs = 25000;

        if (tipHints.length <= 1) {
            setTipVisible(true);
            return;
        }

        setTipVisible(true);

        const scheduleNext = () => {
            setTipVisible(false);
            tipTimeoutRef.current = window.setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % tipHints.length);
                setTipVisible(true);
                tipTimeoutRef.current = window.setTimeout(scheduleNext, holdMs);
            }, fadeMs);
        };

        tipTimeoutRef.current = window.setTimeout(scheduleNext, holdMs);

        return () => {
            if (tipTimeoutRef.current) {
                window.clearTimeout(tipTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="tip-hints" data-visible={isTipVisible ? 'true' : 'false'}>
            <span>Tip: {tipHints[tipIndex]}</span>
        </div>
    );
};

export { TipHints };
