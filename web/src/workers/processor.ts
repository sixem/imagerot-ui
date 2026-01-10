import type { TProcessorInput, TEstimateRecord } from '@/data/types';

import { unflatten } from '@/utils/';
import { WorkItemType } from '@/data/enums';
import * as imagerot from 'imagerot/browser';

self.onmessage = async (event: MessageEvent<TProcessorInput>) => {
    const { image, workflow } = {
        image: event.data.image,
        workflow: event.data.workflow.filter((item) => !item.muted)
    };

    // Bad image data
    if (!image || !image.buffer) {
        return self.postMessage(null);
    }

    const file = new File([image.buffer], image.name, { type: image.type });

    // Nothing is applied, return original image
    if (workflow.length === 0) {
        return self.postMessage({
            overhead: 0,
            estimates: { modes: {}, effects: {} },
            image: {
                file,
                url: URL.createObjectURL(file),
                size: image.size,
                id: image.id
            }
        });
    }

    // Stage file and calculate overhead
    let start = performance.now();
    let staged = await imagerot.stage({ data: file });
    let overhead = (performance.now() - start);

    const pixels = (staged.width * staged.height);
    const estimates: TEstimateRecord = { modes: {}, effects: {} };

    // Apply every item in the workflow to the staged variable
    for (const item of workflow) {
        start = performance.now();

        if (item.type === WorkItemType.effect) {
            staged = await imagerot.useEffect(staged, item.key, unflatten(item.config) as {
                [key: string]: string | number
            });

            estimates.effects[item.key] = (
                [...(estimates.effects[item.key] || []), pixels / (performance.now() - start)]
            );
        } else if (item.type === WorkItemType.mode) {
            staged = await imagerot.useMode(staged, item.key);

            estimates.modes[item.key] = (
                [...(estimates.modes[item.key] || []), pixels / (performance.now() - start)]
            );
        }
    }

    // Encode in worker to keep main thread responsive
    start = performance.now();
    const blobValue = await (async () => {
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(staged.width, staged.height);
            const context = canvas.getContext('2d');

            if (context) {
                const pixels = staged.data instanceof Uint8ClampedArray
                    ? staged.data
                    : new Uint8ClampedArray(staged.data);

                context.putImageData(new ImageData(pixels, staged.width, staged.height), 0, 0);

                try {
                    return await canvas.convertToBlob({ type: file.type || 'image/png' });
                } catch {
                    // Fall back to library encoder below.
                }
            }
        }

        return imagerot.bufferToBlob(staged);
    })();
    const blob = blobValue instanceof Blob
        ? blobValue
        : await fetch(blobValue).then((res) => res.blob());
    const url = typeof blobValue === 'string'
        ? blobValue
        : URL.createObjectURL(blob);
    overhead += (performance.now() - start);

    self.postMessage({
        overhead,
        estimates,
        image: {
            file: new File([blob], image.name, { type: image.type }),
            url,
            size: staged.data.length,
            dimensions: [staged.width, staged.height],
            id: image.id
        }
    });
};
