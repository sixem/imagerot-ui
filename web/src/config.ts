const config = {
    filetypes: {
        allowed: [
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/avif'
        ]
    },
    notifications: {
        defaultDuration: 5000
    },
    tooltips: {
        delay: 250
    },
    selections: {
        defaults: {
            mode: 'pixelsort',
            effect: 'degrade'
        }
    }
};

export { config };
