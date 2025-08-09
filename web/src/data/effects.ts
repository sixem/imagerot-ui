import type { TEffects } from './types';

import { EffectType } from './enums';

const { string, number, object, color } = EffectType;

export const Effects: TEffects = {
    degrade: {
        description: 'Adds JPEG artifacts to the image.',
        format: 'Degrade (JPEG Artifacting)',
        config: {
            quality: {
                type: number, min: 0, current: 7, max: 100, f: (n) => n / 100,
                desc: 'A lower value is worse quality'
            }
        },
    },
    fractalNoise: {
        description: 'Adds a fractal noise effect to the image.',
        format: 'Fractal Noise',
        config: {
            octaves: {
                type: number, min: 0, current: 4, max: 10, f: (n) => n,
                desc: 'Number of noise layers'
            },
            persistence: {
                type: number, min: 0, current: 50, max: 100, f: (n) => n / 100,
                desc: 'Amplitude falloff per octave'
            },
            scale: {
                type: number, min: 0, current: 4, max: 10, f: (n) => n,
                desc: 'Initial frequency/zoom; higher for finer noise'
            },
            intensity: {
                type: number, min: 0, current: 50, max: 100, f: (n) => n / 100,
                desc: 'Strength of noise overlay'
            }
        },
    },
    waveDistort: {
        description: 'Adds a wave distort effect to the image.',
        format: 'Wave Distort',
        config: {
            amplitude: {
                type: number, min: 0, current: 10, max: 100, f: (n) => n,
                desc: 'Amplitude of the wave distortion'
            },
            frequency: {
                type: number, min: 0, current: 5, max: 100, f: (n) => n / 100,
                desc: 'Frequency of the wave distortion'
            },
            axis: { type: string, values: ['x', 'y'], desc: 'Axis to apply the distortion along' }
        },
    },
    anaglyph: {
        description: 'Adds an anaglyph effect (3D effect) to the image.',
        format: 'Anaglyph (3D effect)',
        config: {
            redShift: {
                type: object,
                values: {
                    x: {
                        type: number, min: -100, current: 5, max: 100, f: (n) => n,
                        desc: 'Red channel horizontal shift'
                    },
                    y: {
                        type: number, min: -100, current: 0, max: 100, f: (n) => n,
                        desc: 'Red channel vertical shift'
                    },
                }
            },
            greenShift: {
                type: object,
                values: {
                    x: {
                        type: number, min: -100, current: -5, max: 100, f: (n) => n,
                        desc: 'Green channel horizontal shift'
                    },
                    y: {
                        type: number, min: -100, current: 0, max: 100, f: (n) => n,
                        desc: 'Green channel vertical shift'
                    },
                }
            },
            blueShift: {
                type: object,
                values: {
                    x: {
                        type: number, min: -100, current: 0, max: 100, f: (n) => n,
                        desc: 'Blue channel horizontal shift'
                    },
                    y: {
                        type: number, min: -100, current: 5, max: 100, f: (n) => n,
                        desc: 'Blue channel vertical shift'
                    },
                }
            },
        },
    },
    pixelate: {
        description: 'Pixelates the image.',
        format: 'Pixelate',
        config: {
            intensity: {
                type: number, min: 0, current: 8, max: 100, f: (n) => n,
                desc: 'Pixel block size (larger = more pixelation)'
            },
        },
    },
    dither: {
        description: 'Adds dithering to the image.',
        format: 'Dither',
        config: {
            intensity: {
                type: number, min: 0, current: 50, max: 100, f: (n) => n / 100,
                desc: 'Dither strength'
            },
        },
    },
    blur: {
        description: 'Adds motion blur to the image.',
        format: 'Blur',
        config: {
            intensity: {
                type: number, min: 0, current: 5, max: 100, f: (n) => n,
                desc: 'Blur strength'
            },
            direction: { type: string, values: ['horizontal', 'vertical'], desc: 'Direction of the blur' },
        },
    },
    rectangles: {
        description: 'Adds random rectangles to the image.',
        format: 'Rectangles',
        config: {
            offset: {
                type: number, min: 0, current: 5, max: 100, f: (n) => n, unit: 'px',
                desc: 'Offset from initial position'
            },
            intensity: {
                type: number, min: 0, current: 10, max: 100, f: (n) => n,
                desc: 'Intensity scale'
            },
            sizeModifier: {
                type: number, min: 0, current: 10, max: 100, f: (n) => n / 10,
                desc: 'Size modifier for the rectangles'
            },
            invertChance: {
                type: number, min: 0, current: 15, max: 100, f: (n) => n / 100,
                desc: 'Odds of the rectangle inverting its color'
            },
        },
    },
    grayscale: {
        description: 'Applies a grayscale filter to the image.',
        format: 'Grayscale',
        config: {
            intensity: {
                type: number, min: 0, current: 100, max: 100, f: (n) => n / 100,
                desc: 'Scale from fully colored (0) to fully grayscale (1)'
            },
        },
    },
    noise: {
        description: 'Applies noise to the image.',
        format: 'Noise',
        config: {
            intensity: {
                type: number, min: 0, current: 10, max: 100, f: (n) => n,
                desc: 'A higher value will increase the noise effect'
            },
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
            brightness: {
                type: number, min: -100, current: 10, max: 100, f: (n) => n,
                desc: 'A higher value will increase the brightness'
            },
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
            opacity: {
                type: number, min: 0, current: 25, max: 100, f: (n) => n / 100,
                desc: 'Opacity of the scanlines'
            },
            thickness: {
                type: number, min: 0, current: 2, max: 10, f: (n) => n, unit: 'px',
                desc: 'Thickness of each scanline'
            },
            lines: {
                type: number, min: 0, current: 100, max: 200, f: (n) => n,
                desc: 'Number of scanlines across the image'
            },
        },
    },
    interferenceLines: {
        description: 'Adds inferference scanlines to the image.',
        format: 'Interference Lines',
        config: {
            lineThickness: {
                type: number, min: 0, current: 2, max: 10, f: (n) => n,
                desc: 'Base thickness of interference lines'
            },
            interferenceIntensity: {
                type: number, min: 0, current: 30, max: 100, f: (n) => n / 100,
                desc: 'Strength of the interference pattern'
            },
            noiseIntensity: {
                type: number, min: 0, current: 10, max: 100, f: (n) => n / 100,
                desc: 'Amount of noise mixed into the lines'
            },
            colorBleed: {
                type: number, min: 0, current: 20, max: 100, f: (n) => n / 100,
                desc: 'Channel bleed between colors'
            },
        },
    },
    hueShift: {
        description: 'Shifts the colors of the image.',
        format: 'Hue Shift',
        config: {
            shift: {
                type: number, min: 0, current: 10, max: 360, f: (n) => n, unit: '°',
                desc: 'Hue rotation amount in degrees'
            },
        },
    },
    chromaticAberration: {
        description: 'Applies chromatic aberration to the image.',
        format: 'Chromatic Aberration',
        config: {
            intensity: {
                type: number, min: 0, current: 5, max: 100, f: (n) => n,
                desc: 'Amount of RGB channel separation'
            },
        },
    },
    heatmap: {
        description: 'Applies a pseudo-heatmap to the image.',
        format: 'Heatmap',
        config: {
            intensity: {
                type: number, min: 0, current: 8, max: 100, f: (n) => n / 10,
                desc: 'Strength of the false-color mapping'
            },
        },
    },
    solarize: {
        description: 'Applies solarization to the image.',
        format: 'Solarize',
        config: {
            intensity: {
                type: number, min: 0, current: 50, max: 100, f: (n) => n / 100,
                desc: 'Level of tone inversion in highlights'
            },
        },
    },
    borders: {
        description: 'Adds borders to the image.',
        format: 'Borders',
        config: {
            size: {
                type: number, min: 0, current: 5, max: 1000, f: (n) => n, unit: 'px',
                desc: 'Border width'
            },
            opacity: {
                type: number, min: 0, current: 100, max: 100, f: (n) => n / 100,
                desc: 'Border opacity'
            },
            color: {
                type: color, current: [0, 0, 0],
                desc: 'Border color (RGB)'
            },
        },
    },
};
