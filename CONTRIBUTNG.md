## Project Setup

DCS Dropzone is an Electron application built with the following technologies:

- [TypeScript](https://www.typescriptlang.org/) - Language
- [PNPM](https://pnpm.io/) - Package Manager

- [Electron](https://www.electronjs.org/) - Desktop Application
- [Electron Vite](https://electron-vite.org/) - Development and Build Tools
- [Electron TRPC](https://electron-trpc.dev/) - RPC between renderer and main

- [React](https://reactjs.org/) - UI Framework
- [Mantine](https://mantine.dev/) - UI Components
- [NestJS](https://nestjs.com/) - Backend Framework
- [Vitest](https://vitest.dev/) - Testing Framework

Some level of familiarity with these technologies is recommended before contributing to the project.

### Overview

The following is a brief overview of the project structure:

- `src/main` - Contains the main process code.
  - `src/main/index.ts` - Contains the main entry point for the application.
  - `src/main/router.ts` - Contains the trpc-router for the main process. This calls the bootstrap function to create the NestJS App and then exposes trpc procedures to the renderer.
  - `src/main/bootstrap.ts` - Contains the entrypoint for the NestJS application.
- `src/renderer` - Contains the renderer process code.
  - `src/renderer/index.html` - Contains the main HTML file for the renderer process.
  - `src/renderer/main.tsx` - Contains the main entry point for the renderer process. This creates the React application and mounts it to the DOM.
- `src/preload` - Contains the preload script for the renderer process.
  - `src/preload/index.ts` - Contains the preload script that is executed before the renderer process which exposes trpc procedures to the renderer.
- `src/lib` - Contains shared code between the main and renderer processes.

### Install

To get started clone the project and run the following command to install the project dependencies:

```bash
$ pnpm install
```

### Development

To run the project in development mode, run:

```bash
$ pnpm run dev
```

This will enable hot-reloading (for the renderer) and open the application in a new window.

Hot Reloading for the main process is not supported at the moment, so you will need to re-run dev to see changes in the main process.

### Build

To build the project, run:

```bash
$ pnpm run build
```

This will generate a `dist` folder with the compiled files.

The installer is present in:

```text
\dist\dcs-dropzone-{VERSION}-setup.exe
```

The unpacked contents can be ran without installing from:

```text
\dist\win-unpacked\dcs-dropzone.exe
```

## Running Tests

Tests are run using vitest. To run the tests, run the following command:

```bash
npm run test
```

For running individual tests in the main make sure to use the config, if running within an ide make sure you specify the config in the run configuration. i.e.:

```bash
vitest src/main/utils/get-release-asset.test.ts --run --config vitest.config.node.ts
```

### Concepts

### Asset

An "asset" refers to a file or a collection of files associated with a mod.

Assets contain the data and resources used by the mod. The application manages these assets by:

- Downloading necessary files.
- Extracting files from archives if needed.
- Creating symlinks to integrate assets into the game's directory structure.
- Enabling or disabling assets based on the mod's state.

### Managers

Where the Renderer needs to send an Operation to the main process, i.e. Subscribing to a Mod, Enabling a Mod etc it will do this via a Manager in the main process. The Manager will then call the appropriate service in the main process to perform the operation.

##### SubscriptionManager

The `SubscriptionManager` manages mod subscriptions, including subscribing to mods, handling related assets and tasks, and managing the state of subscriptions and releases. It also allows opening the mod's write directory in the file explorer.

##### LifecycleManager

The `LifecycleManager` is responsible for toggling mods between enabled and disabled states. It manages the creation and removal of symlinks for mod assets and provides methods to query the state of mod assets.

##### TaskManager

The `TaskManager` oversees the processing of asset tasks, ensuring tasks are executed in the correct order and their progress and status are tracked. It periodically checks for pending tasks and manages their execution.

##### SettingsManager

The `SettingsManager` handles application settings, providing default values for settings related to the registry URL, write directories, and installation directories when they are not explicitly set.

##### UpdateManager

The `UpdateManager` handles checking for application updates and applying them. It can check for available updates, notify the user, and install the updates by restarting the application.

#### Router

The `Router` is responsible for exposing trpc procedures to the renderer process.

For the most part the Router will call the appropriate Manager to perform the operation.

Some procedures however will call services directly, i.e. the Get and Set values for configs or the electron updater.

## Testing the Updater

See [AUTO-UPDATER.md](AUTO-UPDATER.md) for more information on testing the updater.
