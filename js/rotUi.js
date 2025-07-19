(async () => {
    // Query selector shorthand with caching
    const $_CACHE = {};
    const $ = (selector, useCache = true) => {
        selector = selector.replace(/@/g, '#');
        if (!useCache) return document.querySelector(selector);
        if (!$_CACHE[selector]) $_CACHE[selector] = document.querySelector(selector);
        return $_CACHE[selector];
    };

    // Predefined effects with descriptions and default configurations
    const predefinedEffects = {
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
            description: 'Adds a anaglyph effect to the image.',
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

    // Predefined modes
    const predefinedModes = {
        pixelsort: {
            format: 'Pixel Sort',
            description: 'Adds the pixel sort mode to the image.',
        },
        mirrorfold: {
            format: 'Mirror Fold',
            description: 'Adds a mirror fold glitch to the image.',
        },
        quadtree: {
            format: 'Quadtree Pixelation',
            description: 'Adds quadtree pixelation to the image.',
        },
        nostalgia: {
            format: 'Nostalgia',
            description: 'Adds the nostalgia mode to the image.',
        },
        chimera: {
            format: 'Chimera',
            description: 'Adds the chimera mode to the image.',
        },
        vaporwave: {
            format: 'Vaporwave',
            description: 'Adds the vaporwave mode to the image.',
        },
        lacunae: {
            format: 'Lacunae',
            description: 'Adds the lacunae mode to the image.',
        },
        acid: {
            format: 'Acid',
            description: 'Adds the acid mode to the image.',
        },
    };

    // Supported image types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/avif', 'image/webp'];

    // Workflow structure to hold effects and modes in order
    const workFlowStructure = {};

    // Loading state flag
    let isLoading = false;

    // Selected image file and its blob URL
    const selected = {
        file: $('img@output').getAttribute('src'),
        blob: $('img@output').getAttribute('src'),
    };

    // Web Worker for image processing
    const worker = new Worker('./js/rotWorker.js');

    // Utility to create DOM elements
    const createElement = (type, text = '', attributes = {}) => {
        const element = document.createElement(type);
        element.textContent = text;

        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }

        return element;
    };

    // Utility to capitalize strings
    const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    // Get or create overlay element, optionally clearing its content
    const getOverlay = (clearOnGet = true) => {
        let overlay = $('div.content > div.wrapper > @overlay', false);

        if (!overlay) {
            overlay = createElement('div', '', { id: 'overlay' });
            $('div.content > div.wrapper').appendChild(overlay);

            overlay.addEventListener('click', (e) => {
                if (e.target.id === 'overlay') {
                    e.target.remove();
                }
            });
        }

        if (clearOnGet) overlay.innerHTML = '';

        return overlay;
    };

    // Create a dialog item for the overlay
    const createDialogItem = ({ header, content }) => {
        const container = createElement('div', '', { class: 'overlayDialog' });
        const headerDiv = createElement('div', header, { class: 'dialogHeader' });

        container.appendChild(headerDiv);

        if (content) {
            if (Array.isArray(content)) {
                content.forEach((item) => container.appendChild(item));
            } else {
                container.appendChild(content);
            }
        }

        const buttonExit = createElement('div', 'X', { class: 'dialogExit' });
        buttonExit.addEventListener('click', () => getOverlay().remove());
        headerDiv.appendChild(buttonExit);

        return container;
    };

    // Toggle loading state and update UI accordingly
    const setLoadingState = (state) => {
        isLoading = state;
        $('@loading').style.opacity = state ? '1' : '0';

        if (isLoading) {
            $('div@generate').textContent = 'Working ...';
            $('div@generate').classList.add('processing');
        } else {
            $('div@generate').textContent = 'Process image';
            $('div@generate').classList.remove('processing');
        }
    };

    // Generate timestamp for file naming
    const getTimestamp = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
    };

    // Copy text to clipboard with fallback support
    const clipboardCopy = (text, callback = null) => {
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (callback) callback({ type: 'Fallback', successful });
            } catch (err) {
                if (callback) callback({ type: 'Fallback', successful: false });
            }

            document.body.removeChild(textArea);
            return;
        }

        navigator.clipboard
            .writeText(text)
            .then(() => {
                if (callback) callback({ type: 'async', successful: true });
            })
            .catch(() => {
                if (callback) callback({ type: 'async', successful: false });
            });
    };

    // Timer for notification visibility
    let notifyTimer = null;

    // Display temporary notification
    const setNotify = (state) => {
        clearTimeout(notifyTimer);
        $('@notify').style.opacity = state ? '1' : '0';

        if (!state) return;

        $('@notify').textContent = state;
        notifyTimer = setTimeout(() => {
            $('@notify').style.opacity = '0';
        }, 4000);
    };

    // Handle uploaded file, validate type, and update preview
    const handleFile = (file = null) => {
        if (isLoading) {
            alert('Please wait for the current process to finish.');
            return;
        }
        if (!file || !file.name || !file.type) return;

        if (!validImageTypes.includes(file.type)) {
            setNotify(`Type ${file.type} is not a valid format.`);
            return;
        }

        selected.file = file;
        selected.blob = URL.createObjectURL(file);
        $('img@output').src = selected.blob;
        setNotify(`Loaded ${file.name} ...`);
    };

    // Listen for messages from the worker
    worker.addEventListener('message', (event) => {
        const { state, status, blob, size, dimensions } = event.data;

        if (state === 1) {
            // Progress update
            setNotify(`${status} ...`);
        } else if (state === 2) {
            // Processing complete
            const [width, height] = dimensions;
            $('img@output').setAttribute('src', blob);
            setNotify(`Done! [Length: ${size} | ${width}x${height}]`);
            setLoadingState(false);

            if (window.matchMedia('(max-width: 900px)').matches) {
                window.scrollTo(0, 0);
            }
        } else if (state === 0) {
            // Error occurred
            setLoadingState(false);
        }
    });

    // File input change handler
    $('input[type="file"]').addEventListener('change', (e) => {
        handleFile(e.target.files[0] || null);
    });

    // Reset file input value on load
    $('input[type="file"]').value = '';

    // Handle image options: save, open, reset
    $('div.options').addEventListener('click', (e) => {
        const img = $('img@output');
        if (!img.src) return;

        const classes = e.target.classList;
        if (classes.contains('fileSave')) {
            const saveAsName = `${getTimestamp()}.png`;
            saveAs(img.src, saveAsName); // Assuming saveAs is defined elsewhere
            setNotify(`Saved as ${saveAsName}`);
        } else if (classes.contains('fileOpen')) {
            window.open(img.src, '_blank');
        } else if (classes.contains('fileReset')) {
            img.src = selected.blob;
        }
    });

    // Populate select elements alphabetically
    const populateSelect = (selectSelector, items) => {
        const select = $(selectSelector);
        select.innerHTML = '';

        const entries = Object.entries(items).sort((a, b) => {
            const nameA = a[1].format || a[0];
            const nameB = b[1].format || b[0];
            return nameA.localeCompare(nameB);
        });

        entries.forEach(([key, value]) => {
            select.appendChild(createElement('option', value.format || key, { value: key }));
        });
    };

    // Populate effect and mode selects
    populateSelect('select@effectSelect', predefinedEffects);
    populateSelect('select@modeSelect', predefinedModes);

    // Index for workflow items
    let workFlowIndex = 0;

    // Utility to flatten values for display
    const flattenValues = (val) => {
        if (Array.isArray(val)) return val.join(',');
        if (typeof val === 'object' && val !== null) {
            return Object.values(val).map(flattenValues).join(',');
        }
        return val;
    };

    // Add item to workflow UI and structure
    const workflowAddItem = (type, name, config) => {
        const container = createElement('div', '', {
            class: `workItem type${capitalize(type)}`,
            'data-index': workFlowIndex,
        });

        const span = createElement('span', capitalize(config.format || name));

        if (config.options && Object.keys(config.options).length > 0) {
            const optsStr = Object.values(config.options).map(flattenValues).join(',');
            span.appendChild(createElement('span', `[${optsStr}]`));
        }

        container.append(span, createElement('div', '', { class: 'remove' }));

        workFlowStructure[workFlowIndex] = JSON.parse(JSON.stringify(config));

        $('div@workOrder').appendChild(container);
        $('div@workOrder').classList.remove('workEmpty');

        workFlowIndex++;
    };

    // Get current workflow items in order
    const workflowGet = () => {
        return [...$('div@workOrder').querySelectorAll(':scope > div.workItem')].map((item) => {
            return workFlowStructure[item.getAttribute('data-index')];
        });
    };

    // Currently selected mode
    let modeSelected = null;

    // Add selected mode to workflow
    $('div.selectButtonSet > div.button').addEventListener('click', () => {
        if (!modeSelected) return;

        const [name] = modeSelected;
        workflowAddItem('mode', name, { mode: name });
    });

    // Handle mode selection change
    const onModeSelect = () => {
        const modeName = $('select@modeSelect').value;
        if (!predefinedModes[modeName]) return;

        modeSelected = [modeName, predefinedModes[modeName]];

        if (predefinedModes[modeName].description) {
            $('div.modeAdd div.description').textContent = predefinedModes[modeName].description.replace(/\.$/, "");
        }
    };

    // Handle effect selection change and build config UI
    const onEffectSelect = () => {
        const effectName = $('select@effectSelect').value;
        if (!predefinedEffects[effectName]) return;

        $('div.effectConfig').innerHTML = '';

        const addButton = createElement('div', 'Add effect to workflow', { class: 'button' });

        const config = {
            effect: effectName,
            options: {},
        };

        if (predefinedEffects[effectName].description) {
            $('div.effectConfig').appendChild(
                createElement('div', predefinedEffects[effectName].description.replace(/\.$/, ""), { class: 'description' })
            );
        }

        if (predefinedEffects[effectName].format) {
            config.format = predefinedEffects[effectName].format;
        }

        if (predefinedEffects[effectName].config) {
            for (const [key, value] of Object.entries(predefinedEffects[effectName].config)) {
                if (value[0] === 'number') {
                    const [min, current, max, transform, symbol, title] = value.slice(1);

                    config.options[key] = transform(current);

                    const label = createElement(
                        'div',
                        `${capitalize(key)} (${config.options[key]}${symbol || ''}):`,
                        {
                            class: 'configItemHeader numeric',
                            title: title || '',
                        }
                    );

                    const range = createElement('input', '', {
                        type: 'range',
                        min,
                        max,
                        value: current,
                        'data-actual': config.options[key],
                    });

                    range.addEventListener('input', (e) => {
                        config.options[key] = transform(e.target.value);
                        range.setAttribute('data-actual', config.options[key]);
                        label.textContent = `${capitalize(key)} (${config.options[key]}${symbol || ''}):`;
                    });

                    $('div.effectConfig').append(label, range);
                } else if (value[0] === 'object') {
                    const subconfig = value[1];
                    const groupLabel = createElement('div', `${capitalize(key)}:`, { class: 'configItemHeader group' });
                    const groupContainer = createElement('div', '', { style: 'display: flex; flex-direction: row; gap: 10px;' });
                    $('div.effectConfig').append(groupLabel, groupContainer);

                    for (const [subkey, subvalue] of Object.entries(subconfig)) {
                        if (subvalue[0] === 'number') {
                            const [min, current, max, transform, symbol, title] = subvalue.slice(1);

                            if (!config.options[key]) config.options[key] = {};
                            config.options[key][subkey] = transform(current);

                            const sublabel = createElement(
                                'div',
                                `${capitalize(subkey)} (${config.options[key][subkey]}${symbol || ''}):`,
                                {
                                    class: 'configItemHeader numeric sub',
                                    title: title || '',
                                }
                            );

                            const range = createElement('input', '', {
                                type: 'range',
                                min,
                                max,
                                value: current,
                                'data-actual': config.options[key][subkey],
                            });

                            range.addEventListener('input', (e) => {
                                config.options[key][subkey] = transform(e.target.value);
                                range.setAttribute('data-actual', config.options[key][subkey]);
                                sublabel.textContent = `${capitalize(subkey)} (${config.options[key][subkey]}${symbol || ''}):`;
                            });

                            const subContainer = createElement('div', '', { style: 'flex: 1;' });
                            subContainer.append(sublabel, range);
                            groupContainer.append(subContainer);
                        }
                        // Add support for other sub-types if needed in the future
                    }
                } else if (value[0] === 'string' && Array.isArray(value[1])) {
                    const input = createElement('select', '', { style: 'margin-top: 8px' });

                    value[1].forEach((option) => {
                        if (!config.options[key]) config.options[key] = option;
                        input.appendChild(createElement('option', option, { value: option }));
                    });

                    input.addEventListener('change', (e) => {
                        config.options[key] = e.target.value;
                    });

                    const label = createElement('div', `${capitalize(key)}:`, { class: 'configItemHeader' });

                    $('div.effectConfig').append(label, input);
                } else if (value[0] === 'color') {
                    const current = value[1];
                    const input = createElement('input', '', {
                        'data-jscolor': JSON.stringify({ preset: 'dark' }),
                        value: `rgb(${current.join(', ')})`,
                    });

                    const label = createElement('div', `${capitalize(key)}:`, {
                        class: 'configItemHeader numeric',
                    });

                    $('div.effectConfig').append(label, input);

                    jscolor.install(); // Assuming jscolor is available

                    input.addEventListener('input', () => {
                        config.options[key] = [
                            Math.round(input.jscolor.channels.r),
                            Math.round(input.jscolor.channels.g),
                            Math.round(input.jscolor.channels.b),
                        ];
                    });
                }
            }
        }

        addButton.addEventListener('click', () => {
            workflowAddItem('effect', effectName, config);
        });

        $('div.effectConfig').appendChild(addButton);
    };

    // Set up effect select events and default
    $('select@effectSelect').addEventListener('change', onEffectSelect);
    $('select@effectSelect').value = 'degrade';
    onEffectSelect();

    // Set up mode select events and default
    $('select@modeSelect').addEventListener('change', onModeSelect);
    $('select@modeSelect').value = 'pixelsort';
    onModeSelect();

    // Handle removal of workflow items
    $('div@workOrder').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            const parent = e.target.parentElement;
            const itemIndex = parent.getAttribute('data-index');

            if (workFlowStructure[itemIndex]) {
                delete workFlowStructure[itemIndex];
            }

            parent.remove();

            if (workflowGet().length === 0) {
                $('div@workOrder').classList.add('workEmpty');
            }
        }
    });

    // Show help dialog
    $('div.top > div.help').addEventListener('click', () => {
        const overlay = getOverlay();

        const container = createDialogItem({
            header: 'Basic Usage',
            content: createElement(
                'pre',
                [
                    'Drop an image into the UI or select it manually',
                    'Add effects or modes to the workflow',
                    'The workflow is the order of operation of effects/modes',
                    'You can drag and drop the workflow items to reorder them',
                    'Click \'Process image\' to get your modified image!',
                ]
                    .map((item, index) => `${index + 1}. ${item}`)
                    .join('\n')
            ),
        });

        overlay.appendChild(container);
    });

    // Keyboard shortcuts: Escape to close overlay, Enter to process
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            getOverlay().remove();
        } else if (e.key === 'Enter') {
            $('div@generate').click();
        }
    });

    // Make workflow order sortable
    new Sortable($('div@workOrder'), { animation: 150 });

    // Drag and drop support for image upload
    for (const dropArea of [$('div.image'), $('input[type="file"]')]) {
        let isDragging = false;

        const onDragEnd = (e = null, file = null) => {
            e?.preventDefault();

            const dragging = $('body > div.dragging', false);
            if (dragging) dragging.remove();

            isDragging = false;
            document.body.classList.remove('dragging');
            handleFile(file || null);
        };

        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();

            if (!isDragging) {
                document.body.appendChild(createElement('div', '', { class: 'dragging' }));
                isDragging = true;
                document.body.classList.add('dragging');
            }
        }, false);

        dropArea.addEventListener('dragleave', onDragEnd, false);
        dropArea.addEventListener('drop', (e) => onDragEnd(e, e.dataTransfer.files[0]), false);
    }

    // Import workflow from base64 data
    $('div@import').addEventListener('click', () => {
        const overlay = getOverlay();
        const textArea = createElement('textarea', '', { placeholder: 'Exported data ...' });
        const copyButton = createElement('div', 'Import workflow', { class: 'button' });

        const textLabel = createElement(
            'div',
            'Importing a workflow will overwrite your current workflow.',
            { class: 'label' }
        );

        copyButton.addEventListener('click', () => {
            const inputValue = textArea.value.trim();

            try {
                const decodedData = JSON.parse(atob(inputValue));
                $('div@workOrder').innerHTML = '';
                let total = 0;

                Object.keys(workFlowStructure).forEach((key) => delete workFlowStructure[key]);

                Object.values(decodedData).forEach((value) => {
                    if (!value.effect && !value.mode) return;
                    if (value.effect && !predefinedEffects[value.effect]) return;
                    if (value.mode && !predefinedModes[value.mode]) return;

                    const name = value.effect || value.mode;
                    const config = { [value.effect ? 'effect' : 'mode']: name };
                    if (value.options) config.options = value.options;
                    if (value.format) config.format = value.format;

                    workflowAddItem(value.effect ? 'effect' : 'mode', name, config);
                    total++;
                });

                setNotify(`Imported ${total} workflow item${total !== 1 ? 's' : ''}!`);
                overlay.remove();
            } catch (e) {
                alert('Invalid workflow data!');
                console.error('Error importing workflow: ', e);
            }
        });

        const container = createDialogItem({
            header: 'Import',
            content: [textLabel, textArea, copyButton],
        });

        overlay.appendChild(container);
        textArea.focus();
    });

    // Export current workflow as base64
    $('div@export').addEventListener('click', () => {
        if (Object.keys(workFlowStructure).length === 0) {
            alert('Add something to the workflow first!');
            return;
        }

        const currentWorkflow = workflowGet();

        const data = btoa(
            JSON.stringify(
                currentWorkflow.reduce((acc, item, index) => ({ ...acc, [index]: item }), {})
            )
        );

        const overlay = getOverlay();
        const textArea = createElement('textarea', data, { readonly: true });
        const copyButton = createElement('div', 'Copy to clipboard', { class: 'button' });

        const textLabel = createElement(
            'div',
            'The data below can be imported at any time to load the current workflow.',
            { class: 'label' }
        );

        textArea.addEventListener('focus', () => textArea.select());

        copyButton.addEventListener('click', () => {
            clipboardCopy(data, (e) => {
                setNotify(e.successful ? 'Copied to clipboard!' : 'Failed to copy to clipboard!');
                if (e.successful && overlay) overlay.remove();
            });
        });

        const container = createDialogItem({
            header: 'Export',
            content: [textLabel, textArea, copyButton],
        });

        overlay.appendChild(container);
    });

    // Paste image from clipboard
    document.addEventListener('paste', (event) => {
        const items = (event.clipboardData || window.clipboardData).items;
        for (const item of items) {
            if (item.kind === 'file') {
                handleFile(item.getAsFile());
                break;
            }
        }
    });

    // Process image with current workflow
    $('div@generate').addEventListener('click', () => {
        if (isLoading || !selected.file) return;

        const workflow = workflowGet();
        const obj = { workflow };

        if (typeof selected.file === 'string') {
            obj.url = selected.file;
        } else {
            obj.data = selected.file;
        }

        setLoadingState(true);
        worker.postMessage(obj);
    });
})();