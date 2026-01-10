export const stripExtension = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'image';
    const dotIndex = trimmed.lastIndexOf('.');
    return dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed;
};
