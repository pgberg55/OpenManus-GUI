# OpenManus GUI

A polished, cross-platform Tauri desktop GUI for OpenManus.

## Features

- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Real-Time Updates**: WebSocket streaming for task output
- **Task History**: View and manage past tasks
- **Configuration Management**: Edit OpenManus settings directly from the UI

## Project Structure

```
openmanus-gui/
├── apps/
│   ├── api/           # FastAPI backend service
│   └── desktop/       # Tauri + React frontend
├── config/            # Configuration files
├── scripts/           # Development and utility scripts
└── tests/             # E2E tests with Playwright
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Python](https://www.python.org/) (v3.8 or later)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- System dependencies for Tauri (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pgberg55/OpenManus-GUI.git
   cd OpenManus-GUI
   ```

2. Set up the Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   pnpm install
   ```

## OpenManus Integration

By default, the application uses a simulated version of OpenManus for demonstration purposes. To use the real OpenManus agent:

1. Install the OpenManus package:
   ```bash
   pip install openmanus
   ```

2. The application will automatically detect and use the real OpenManus agent if it's installed. If not, it will fall back to the simulation.

3. You can verify which version is being used by checking the API server logs when starting the application.

## Development

To start the development environment:

```bash
pnpm dev
```

This will:
1. Start the FastAPI server on port 5400
2. Start the Tauri development server
3. Watch for changes in both the API and desktop app

You can also start the components separately:

```bash
# Start only the API server
pnpm api

# Start only the desktop app
pnpm desktop
```

## Building

To build the desktop application:

```bash
pnpm build
```

This will create platform-specific installers in the `apps/desktop/src-tauri/target/release` directory.

## Testing

To run the E2E tests:

```bash
pnpm test
```

## API Endpoints

The FastAPI backend exposes the following endpoints:

- `POST /run` - Run a task with the given prompt
- `GET /history` - Get the last 20 tasks
- `GET /config` - Get the current configuration
- `POST /config` - Update the configuration
- `WebSocket /ws/run` - Run a task with real-time output streaming

## Configuration

The application configuration is stored in `config/config.toml`. You can edit this file directly or use the Settings page in the UI.

## License

MIT