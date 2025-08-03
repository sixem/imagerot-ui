export const readImgAsFile = (img: HTMLImageElement, filename: string = 'image.png', mime: string = 'image/png'): Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas  = document.createElement('canvas');

        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const context = canvas.getContext('2d');

        if (!context) {
            return reject(new Error('Failed to get canvas context'));
        }

        context.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) {
                return reject(new Error('Failed to create blob from canvas'));
            }

            const file = new File([blob], filename, { type: mime });
            resolve(file);
        }, mime);
    });
};
