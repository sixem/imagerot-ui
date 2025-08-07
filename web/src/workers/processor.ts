import type { TProcessorInput } from '@/data/types';

import { WorkItemType } from '@/data/enums';
import * as imagerot from 'imagerot/browser';

self.onmessage = async (event: MessageEvent<TProcessorInput>) => {
    const { image, workflow } = event.data;

    // Bad image data
    if (image.file === null) {
        return self.postMessage(null);
    }

    // Nothing is applied, return original image
    if (workflow.length === 0) {
        return self.postMessage(image);
    }

    // Prepare image file
    let staged = await imagerot.stage({ data: image.file });

    // Apply every item in the workflow to the staged variable
    for (const item of workflow) {
        if (item.muted) continue;
        if (item.type === WorkItemType.EFFECT) {
            staged = await imagerot.useEffect(staged, item.key, item.config as {
                [key: string]: string | number;
            });
        } else if (item.type === WorkItemType.MODE) {
            staged = await imagerot.useMode(staged, item.key);
        }
    }

    // Get Blob URL
    const blob = await imagerot.bufferToBlob(staged);

    self.postMessage({
        image: {
            file: new File([blob], image.file.name, { type: image.file.type }),
            url: blob,
            size: staged.data.length,
            dimensions: [staged.width, staged.height]
        }
    });
};