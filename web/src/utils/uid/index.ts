let counter = 0;

export const uid = () => {
    const base =
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID() : Date.now().toString(36); // Deterministic fallback

    return `${base}-${(counter++).toString(36)}`;
};
