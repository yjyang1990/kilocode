# Kilo Code CLI - Terminal User Interface

A comprehensive NodeJS Terminal User Interface (TUI) application that serves as a command-line equivalent to the existing Kilo Code VSCode extension webview-ui client.

## Overview

The Kilo Code CLI provides a terminal-based interface for interacting with the Kilo Code AI assistant, built using the Ink React-based CLI library. It features a VSCode extension host mock system that dynamically loads and interfaces with the backend extension, ensuring seamless communication between the TUI and the extension backend.

## Features

### ✅ Implemented

- **VSCode Extension Host Mock System**: Replicates VSCode's extension API surface and lifecycle management
- **Message Passing Architecture**: Bidirectional communication between TUI and extension backend
- **Interactive Terminal Interface**: Built with Ink React for responsive terminal UI
- **Multi-View Navigation**: Chat, History, Settings, Modes, and MCP management views
- **Keyboard Navigation**: Full keyboard control with shortcuts (F1-F5 for view switching)
- **Real-time Status Updates**: Live status bar showing workspace, mode, API provider, and task count

### 🚧 In Progress

- **Core Chat Functionality**: Interactive chat interface with message streaming
- **Task Management**: Create, execute, and manage AI tasks
- **Extension Integration**: Full integration with backend extension services

### 📋 Planned

- **Settings Management**: Configure API providers, auto-approval, and preferences
- **Task History**: Browse, search, and manage task history with favorites
- **MCP Integration**: Manage Model Context Protocol servers and tools
- **Mode Switching**: Switch between different AI modes (code, architect, debug, etc.)
- **File Operations**: File reading, writing, and diff viewing in terminal
- **Command Palette**: Quick access to all functionality
- **Data Visualization**: ASCII-based charts and progress indicators

## Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   CLI Entry     │    │  VSCode Extension    │    │   Backend Extension │
│   Point         │    │  Host Mock           │    │   (src/)            │
├─────────────────┤    ├──────────────────────┤    ├─────────────────────┤
│ • Command       │    │ • vscode API Mock    │    │ • ClineProvider     │
│   Parsing       │    │ • Extension Context  │    │ • Task Engine       │
│ • CLI Options   │    │ • Lifecycle Mgmt     │    │ • API Handlers      │
│ • Error         │    │ • Message Bridge     │    │ • MCP Hub           │
│   Handling      │    │ • State Management   │    │ • File Operations   │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
         │                        │                           │
         └────────────────────────┼───────────────────────────┘
                                  │
                    ┌──────────────────────┐
                    │   Ink React TUI      │
                    ├──────────────────────┤
                    │ • Chat Interface     │
                    │ • Settings UI        │
                    │ • History Browser    │
                    │ • Mode Selector      │
                    │ • MCP Manager        │
                    │ • Status Bar         │
                    │ • Navigation         │
                    └──────────────────────┘
```

## Installation

The CLI is part of the Kilo Code workspace and uses pnpm for dependency management:

```bash
# Install dependencies
pnpm install

# Run in development mode
cd cli && pnpm run dev

# Build for production
cd cli && pnpm run build
```

## Usage

### Interactive Chat Session

```bash
# Start interactive chat
pnpm run dev chat

# Start with specific mode
pnpm run dev chat --mode architect

# Start with specific workspace
pnpm run dev chat --workspace /path/to/project
```

### Single Task Execution

```bash
# Execute a single task
pnpm run dev task "Create a React component for user authentication"

# Execute with auto-approval
pnpm run dev task "Fix the TypeScript errors" --auto-approve
```

### View Management

```bash
# View task history
pnpm run dev history

# Open settings
pnpm run dev settings

# Manage modes
pnpm run dev modes

# Manage MCP servers
pnpm run dev mcp
```

## Keyboard Shortcuts

### Global Navigation

- `F1` - Switch to Chat view
- `F2` - Switch to History view
- `F3` - Switch to Settings view
- `F4` - Switch to Modes view
- `F5` - Switch to MCP view
- `Ctrl+C` / `Ctrl+Q` - Exit application

### Chat Interface

- `Enter` - Start typing a message
- `y` - Approve pending action
- `n` - Reject pending action
- `Esc` - Cancel current input

### History View

- `Enter` - Open selected task
- `d` - Delete selected task
- `Esc` - Go back to chat

### Settings View

- `Enter` - Edit selected setting
- `Esc` - Cancel edit or go back

## Project Structure

```
cli/
├── package.json              # Package configuration
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── index.ts             # CLI entry point with command parsing
│   ├── cli/
│   │   └── KiloCodeCLI.ts   # Main CLI application class
│   ├── mock/                # VSCode extension host mock system
│   │   ├── vscode-api.ts    # Mock VSCode API implementation
│   │   ├── extension-context.ts # Mock extension context
│   │   └── extension-host.ts    # Extension host orchestrator
│   ├── communication/       # Message passing system
│   │   └── ipc.ts          # Inter-process communication layer
│   ├── tui/                # Terminal UI components
│   │   ├── App.tsx         # Main TUI application
│   │   └── components/     # Individual UI components
│   │       ├── ChatView.tsx
│   │       ├── HistoryView.tsx
│   │       ├── SettingsView.tsx
│   │       ├── ModesView.tsx
│   │       ├── McpView.tsx
│   │       ├── Navigation.tsx
│   │       └── StatusBar.tsx
│   └── types/              # Local type definitions
│       └── messages.ts     # Message and state types
└── dist/                   # Compiled output
```

## Key Components

### VSCode Extension Host Mock

- **Purpose**: Replicates VSCode's extension API surface for CLI environment
- **Features**: Extension context, event system, workspace simulation, message passing
- **Location**: [`cli/src/mock/`](cli/src/mock/)

### Message Bridge

- **Purpose**: Handles bidirectional communication between TUI and extension backend
- **Features**: Request/response pattern, event broadcasting, timeout handling
- **Location**: [`cli/src/communication/ipc.ts`](cli/src/communication/ipc.ts)

### TUI Application

- **Purpose**: Provides interactive terminal interface using Ink React
- **Features**: Multi-view navigation, keyboard shortcuts, real-time updates
- **Location**: [`cli/src/tui/`](cli/src/tui/)

## Development

### Running in Development Mode

```bash
cd cli
pnpm run dev chat
```

### Building for Production

```bash
cd cli
pnpm run build
```

### Testing

```bash
cd cli
pnpm test
```

## Configuration

The CLI uses the same configuration as the VSCode extension:

- API tokens and provider settings
- Custom modes and prompts
- MCP server configurations
- Auto-approval preferences

Configuration is stored in the same locations as the VSCode extension to ensure consistency.

## Troubleshooting

### Common Issues

1. **TypeScript Build Errors**: The CLI may have type conflicts with workspace dependencies. Use development mode (`pnpm run dev`) for testing.

2. **Extension Loading**: The mock system currently creates a simplified provider. Full extension loading will be implemented in future iterations.

3. **Missing Components**: Some TUI components are placeholder implementations and will be enhanced with full functionality.

### Debug Mode

```bash
NODE_ENV=development pnpm run dev chat
```

## Contributing

The CLI follows the same development patterns as the main Kilo Code extension:

- TypeScript for type safety
- Ink React for terminal UI
- Event-driven architecture
- Modular component design

## Future Enhancements

- **Real Extension Loading**: Load actual compiled extension from `bin-unpacked/extension`
- **Full Feature Parity**: Complete implementation of all webview features
- **Performance Optimization**: Efficient rendering and state management
- **Advanced Terminal Features**: Syntax highlighting, rich text formatting
- **Plugin System**: Extensible architecture for custom TUI plugins
