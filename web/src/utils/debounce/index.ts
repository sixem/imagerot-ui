export const debounce = <Args extends unknown[], R>(
    func: (...args: Args) => R,
    delay: number
): (...args: Args) => void => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (...args: Args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
