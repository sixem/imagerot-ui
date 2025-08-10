export const getImageDimensions = (url: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        
            img.src = '';
            img.remove();
        };

        img.onerror = reject;
        img.src = url;
    });
};