# Kilo Code CLI

Terminal User Interface for Kilo Code - Command-line equivalent to the VSCode extension.

## Installation

```bash
npm install -g @kilo-code/cli
```

## Usage

```bash
# Start interactive chat session
kilocode

# Execute a specific task
kilocode "Create a new React component"

# Show task history
kilocode --history

# Show settings
kilocode --settings
```

## Development

### Building

```bash
pnpm build
```

This will:

1. Compile TypeScript files from `src/` to `dist/`
2. Copy the extension bundle from `../bin-unpacked/extension/` to `dist/kilocode/`

### Production Structure

After building, the `dist/` directory contains:

```
cli/dist/
├── index.js                    # CLI entry point
├── cli/
│   └── KiloCodeCLI.js         # Main CLI class
├── host/
│   ├── ExtensionHost.js       # Extension host implementation
│   └── VSCode.js              # VSCode API mock
├── utils/
│   └── extension-paths.js     # Path resolution utility
└── kilocode/                  # Bundled extension
    ├── dist/
    │   └── extension.js       # Compiled extension
    ├── assets/                # Extension assets
    ├── webview-ui/            # Webview UI files
    └── package.json           # Extension metadata
```

### Path Resolution

The CLI uses a simple path resolution strategy for production:

1. **Extension Bundle Path**: `dist/kilocode/dist/extension.js`
    - Direct path to the compiled extension JavaScript file
2. **Extension Root Path**: `dist/kilocode/`
    - Root directory containing extension assets, webview UI, and metadata

The [`extension-paths.ts`](src/utils/extension-paths.ts) utility resolves these paths relative to the compiled CLI files, making the `dist/` folder portable and distributable.

### Key Files

- [`cli/src/cli/KiloCodeCLI.ts`](src/cli/KiloCodeCLI.ts) - Main CLI class that initializes the extension host
- [`cli/src/host/ExtensionHost.ts`](src/host/ExtensionHost.ts) - Manages the extension lifecycle and message passing
- [`cli/src/host/VSCode.ts`](src/host/VSCode.ts) - Provides VSCode API mocks for the extension
- [`cli/src/utils/extension-paths.ts`](src/utils/extension-paths.ts) - Resolves extension paths for production

### Testing

```bash
pnpm test
```

### Running Locally

```bash
pnpm build
pnpm start
```

## Distribution

The CLI is designed to be distributed as an NPM package. The entire `dist/` folder can be packaged and published, as it contains:

1. All compiled CLI code
2. The bundled extension in `dist/kilocode/`
3. All necessary dependencies (via `node_modules/`)

The path resolution ensures the CLI works correctly regardless of where it's installed.

## Architecture

### Extension Loading

1. CLI starts and resolves extension paths using [`resolveExtensionPaths()`](src/utils/extension-paths.ts)
2. [`ExtensionHost`](src/host/ExtensionHost.ts) loads the extension from `dist/kilocode/dist/extension.js`
3. VSCode API mocks are provided to the extension via [`createVSCodeAPIMock()`](src/host/VSCode.ts)
4. Message bridge connects the TUI with the extension

### Message Flow

```
TUI (Ink Components)
    ↕ (IPC)
MessageBridge
    ↕ (Events)
ExtensionHost
    ↕ (VSCode API)
Extension (extension.js)
```

## License

See [LICENSE](../LICENSE) file in the root directory.
