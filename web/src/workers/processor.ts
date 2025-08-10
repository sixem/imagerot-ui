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
    if (image.file === null) {
        return self.postMessage(null);
    }

    // Nothing is applied, return original image
    if (workflow.length === 0) {
        return self.postMessage(image);
    }

    // Stage file and calculate overhead
    let start = performance.now();
    let staged = await imagerot.stage({ data: image.file });
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

    // Get Blob URL and measure overhead
    start = performance.now();
    const blob = await imagerot.bufferToBlob(staged);
    overhead += (performance.now() - start);

    self.postMessage({
        overhead,
        estimates,
        image: {
            file: new File([blob], image.file.name, { type: image.file.type }),
            url: blob,
            size: staged.data.length,
            dimensions: [staged.width, staged.height]
        }
    });
};