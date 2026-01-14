import type { TPaneSignature } from '@/data/types';

type TPinSignature = (
    current: TPaneSignature["current"],
    setters: TPaneSignature["setters"]
) => Promise<void>;

const pinEditedImage: TPinSignature = async (current, setters) => {
    if (!current.edited) return;

    const blob = await fetch(current.edited.url).then((res) => res.blob());
    const file = new File([blob], current.edited.file?.name || 'image.png', { type: blob.type });
    const url = URL.createObjectURL(file);

    setters.file({ ...current.edited, file, url });
    setters.edit(null);
};

export { pinEditedImage };
