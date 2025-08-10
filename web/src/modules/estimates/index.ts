import type { TEstimateTable, TEstimateRecord, TBucketKeys } from '@/data/types';

import { BucketKeys} from '@/data/enums';
import { getAverage } from '@/utils';
import { listEffects, listModes } from 'imagerot/browser';

export type TEstimates = { makeBucket: (keys: string[]) => {
    [k: string]: {
        measurements: never[];
        averagePpms: null;
    };
} } & TEstimateTable;

/** Initializes a bucket with a set of keys */
const makeBucket: TEstimates['makeBucket'] = (keys: string[]) => {
    return Object.fromEntries(keys.map(k => [k, { measurements: [], averagePpms: null }]));
};

/** Creates estimate buckets for modes and effects */
const bucketModes = makeBucket(listModes());
const bucketEffects = makeBucket(listEffects());

const bucket: TEstimateTable = { modes: bucketModes, effects: bucketEffects, overhead: 0 };

const getBucket = () => bucket;

/**
 * Sets the general overhead for estimation
 */
const setOverhead = (overhead: number) => bucket.overhead = overhead;

/**
 * Adds an estimate record to the existing values and calculates averages
 */
const addRecord = (record: TEstimateRecord) => {
    for (const type of BucketKeys) {
        for (const [key, values] of Object.entries(record[type])) {
            if (values.length > 0) {
                // Update measurements and average
                bucket[type][key].measurements.push(...values);
                bucket[type][key].averagePpms = getAverage(bucket[type][key].measurements);

                const measured = bucket[type][key].measurements.length;

                if (measured > 5) { // Keep the last 5 measurements
                    bucket[type][key].measurements = bucket[type][key].measurements.slice(
                        (measured - 5), measured
                    );
                }
            }
        }
    }

    return bucket;
};

/**
 * Gets the estimated time to process an image in milliseconds
 * given a set of active effects and modes
 */
const getEstimate = (dimensions: [number, number], items: Record<TBucketKeys, string[]>) => {
    const pixels = dimensions[0] * dimensions[1];
    let totalMs = 0;

    for (const type of BucketKeys) {
        for (const key of items[type]) {
            const ppms = bucket[type][key]?.averagePpms ?? null;
            if (ppms === null || ppms <= 0) return null;
            totalMs += (pixels / ppms);
        }
    }

    return totalMs + (bucket.overhead ?? 0);
};

export const estimates = {
    getBucket,
    getEstimate,
    addRecord,
    setOverhead
};
