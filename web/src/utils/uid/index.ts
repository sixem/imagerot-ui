export const uid = (() => {
    let c = 0;

    return () =>
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${(c++).toString(36)}`;
})();
