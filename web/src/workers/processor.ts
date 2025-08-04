import type { TProcessorInput } from '@/data/types';

import { WorkItemType } from '@/data/enums';
import * as imagerot from 'imagerot/browser';

self.onmessage = async (event: MessageEvent<TProcessorInput>) => {
    const { image, workflow } = event.data;

    if (workflow.length === 0 || image.file === null) {
        return self.postMessage({ image });
    }

    let staged = await imagerot.stage({ data: image.file });

    for (const item of workflow) {
        if (item.type === WorkItemType.EFFECT) {
            staged = await imagerot.useEffect(staged, item.key, item.config as {
                [key: string]: string | number;
            });
        } else if (item.type === WorkItemType.MODE) {
            staged = await imagerot.useMode(staged, item.key);
        }
    }

    const blob = await imagerot.bufferToBlob(staged);

    self.postMessage({
        image: {
            file: new File([blob], image.file.name, { type: image.file.type }),
            url: blob
        }
    });
};