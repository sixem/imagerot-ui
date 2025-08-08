

import type { TEffects } from './types';

export const Effects: TEffects = {
    degrade: {
        description: 'Adds JPEG artifacts to the image.',
        format: 'Degrade (JPEG Artifacting)',
        config: {
            quality: ['number', 0, 7, 100, (n) => n / 100, null, 'A lower value is worse quality'],
        },
    },
    fractalNoise: {
        description: 'Adds a fractal noise effect to the image.',
        format: 'Fractal Noise',
        config: {
            octaves: ['number', 0, 4, 10, (n) => n, null, 'Number of noise layers'],
            persistence: ['number', 0, 50, 100, (n) => n / 100, null, 'Amplitude falloff per octave'],
            scale: ['number', 0, 4, 10, (n) => n, null, 'Initial frequency/zoom; higher for finer noise'],
            intensity: ['number', 0, 50, 100, (n) => n / 100, null, 'Strength of noise overlay'],
        },
    },
    waveDistort: {
        description: 'Adds a wave distort effect to the image.',
        format: 'Wave Distort',
        config: {
            amplitude: ['number', 0, 10, 100, (n) => n, null, 'Amplitude of the wave distortion'],
            frequency: ['number', 0, 5, 100, (n) => n / 100, null, 'Frequency of the wave distortion'],
            axis: ['string', ['x', 'y']],
        },
    },
    anaglyph: {
        description: 'Adds an anaglyph effect (3D effect) to the image.',
        format: 'Anaglyph (3D)',
        config: {
            redShift: ['object', {
                x: ['number', -100, 5, 100, (n) => Number(n), null, 'Red channel horizontal shift'],
                y: ['number', -100, 0, 100, (n) => Number(n), null, 'Red channel vertical shift'],
            }],
            greenShift: ['object', {
                x: ['number', -100, -5, 100, (n) => Number(n), null, 'Green channel horizontal shift'],
                y: ['number', -100, 0, 100, (n) => Number(n), null, 'Green channel vertical shift'],
            }],
            blueShift: ['object', {
                x: ['number', -100, 0, 100, (n) => Number(n), null, 'Blue channel horizontal shift'],
                y: ['number', -100, 5, 100, (n) => Number(n), null, 'Blue channel vertical shift'],
            }],
        },
    },
    pixelate: {
        description: 'Pixelates the image.',
        format: 'Pixelate',
        config: {
            intensity: ['number', 0, 8, 100, (n) => n],
        },
    },
    dither: {
        description: 'Adds dithering to the image.',
        format: 'Dither',
        config: {
            intensity: ['number', 0, 50, 100, (n) => n / 100],
        },
    },
    blur: {
        description: 'Adds motion blur to the image.',
        format: 'Blur',
        config: {
            intensity: ['number', 0, 5, 100, (n) => n],
            direction: ['string', ['horizontal', 'vertical']],
        },
    },
    rectangles: {
        description: 'Adds random rectangles to the image.',
        format: 'Rectangles',
        config: {
            offset: ['number', 0, 5, 100, (n) => n, 'px', 'Offset from initial position'],
            intensity: ['number', 0, 10, 100, (n) => n, null, 'Intensity scale'],
            sizeModifier: ['number', 0, 10, 100, (n) => n / 10, null, 'Size modifier for the rectangles'],
            invertChance: ['number', 0, 15, 100, (n) => n / 100, null, 'Odds of the rectangle inverting its color'],
        },
    },
    grayscale: {
        description: 'Applies a grayscale filter to the image.',
        format: 'Grayscale',
        config: {
            intensity: ['number', 0, 100, 100, (n) => n / 100],
        },
    },
    noise: {
        description: 'Applies noise to the image.',
        format: 'Noise',
        config: {
            intensity: ['number', 0, 10, 100, (n) => n],
        },
    },
    sharpen: {
        description: 'Sharpens the image.',
        format: 'Sharpen',
        config: null,
    },
    brightness: {
        description: 'Adjusts the brightness.',
        format: 'Brightness',
        config: {
            brightness: ['number', -100, 10, 100, (n) => n],
        },
    },
    rainbow: {
        description: 'Applies rainbow colors to the image.',
        format: 'Rainbow',
        config: null,
    },
    scanlines: {
        description: 'Adds scanlines to the image.',
        format: 'Scanlines',
        config: {
            opacity: ['number', 0, 25, 100, (n) => n / 100],
            thickness: ['number', 0, 2, 10, (n) => n, 'px'],
            lines: ['number', 0, 100, 200, (n) => n],
        },
    },
    interferenceLines: {
        description: 'Adds inferference scanlines to the image.',
        format: 'Interference Lines',
        config: {
            lineThickness: ['number', 0, 2, 10, (n) => n],
            interferenceIntensity: ['number', 0, 30, 100, (n) => n / 100],
            noiseIntensity: ['number', 0, 10, 100, (n) => n / 100],
            colorBleed: ['number', 0, 20, 100, (n) => n / 100],
        },
    },
    hueShift: {
        description: 'Shifts the colors of the image.',
        format: 'Hue Shift',
        config: {
            shift: ['number', 0, 10, 360, (n) => n, '°'],
        },
    },
    chromaticAberration: {
        description: 'Applies chromatic aberration to the image.',
        format: 'Chromatic Aberration',
        config: {
            intensity: ['number', 0, 5, 100, (n) => n],
        },
    },
    heatmap: {
        description: 'Applies a pseudo-heatmap to the image.',
        format: 'Heatmap',
        config: {
            intensity: ['number', 0, 8, 100, (n) => n / 10],
        },
    },
    solarize: {
        description: 'Applies solarization to the image.',
        format: 'Solarize',
        config: {
            intensity: ['number', 0, 50, 100, (n) => n / 100],
        },
    },
    borders: {
        description: 'Adds borders to the image.',
        format: 'Borders',
        config: {
            size: ['number', 0, 5, 1000, (n) => n, 'px'],
            opacity: ['number', 0, 100, 100, (n) => n / 100],
            color: ['color', [0, 0, 0]],
        },
    },
};
