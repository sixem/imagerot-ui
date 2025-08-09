# ImageRot UI

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Sass](https://img.shields.io/badge/Sass-C69?logo=sass&logoColor=fff)
![Tauri](https://img.shields.io/badge/Tauri-24C8D8?logo=tauri&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=fff)

[ImageRot](https://github.com/sixem/imagerot/) (/ˈɪm.ɪdʒ.rɒt/ noun) is a lightweight, efficient, cross-environment image library. It lets you apply unique effects and modes to images by manipulating raw image buffers.

This is a browser- and desktop-compatible user interface for the library ImageRot, made in React, using Vite and Tauri! :sparkles:

To get started, you can either download the latest release [here](https://github.com/sixem/imagerot-ui/releases) or visit the [Web UI](https://five.sh/imagerot/ui/) directly.

<img width="1788" height="906" alt="rot-ui" src="https://github.com/user-attachments/assets/110d9a61-ac8d-49c7-838f-9ae8b7b01918" />

## :zap: Quick Usage

1. Drag an image into the UI, or click to select one.
    - This will load the image into memory, and you can always reset to the base image by using the toolbar in the top-right of the canvas.
      
2. Select effects and/or modes from the sidebar, and add them to the workflow.
    - The workflow items will be applied to the image in the order in which they appear.
    - You can re-order them by simply dragging them around.
    - These items can also be muted (eye toggle button), which will exclude them from the process entirely until unmuted.
  
4. Finally, process the image and get your result!

## Development and Building

- :package: Dependencies: [Rust](https://rustup.rs/) - [Node](https://nodejs.org/en/download)

This project is set up as a monorepo, where Tauri handles the desktop application, and Vite and React handles the general frontend.

The preferred package manger is `pnpm`, and Cargo/Rust as well as a newer Node version (I'd recommend 22+) are also required.

To get started, clone the repository and install the dependencies.

```bash
git clone git@github.com:sixem/imagerot-ui.git
cd imagerot-ui
pnpm install
```

### :test_tube: Development

To start the development environment, run the `dev` script in the monorepo.

```bash
pnpm run dev
```

This will spin up Vite at `http://localhost:5173` for web testing, and the Tauri application will also open for desktop testing.

### :bricks: Building

There are two build scripts available: `build:web` and `build:desktop`.

- `build:web` builds the web version (the Vite/React frontend) for web usage only.
- `build:desktop` builds the web version (prerequisite) *and* the desktop versions.

## Roadmap

This is a new project, and additional features are expected to be added over time. There is no current timeline for this. As for now, here are some potential features that may be implemented in the future:

- Locally stored presets
- More advanced saving options (conversion to other image types etc.)
- Implementation of a simple keybind system
- Image comparison slider for the unmodified and modified image

## Disclaimers

This is just a fun personal hobby project, but feedback is still very much welcome! Whether that's in the form of suggestions or by reporting general issues or bugs you've found.
