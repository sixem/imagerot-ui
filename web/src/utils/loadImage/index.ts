export const loadImage = (url: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new globalThis.Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = url;
    });
};
