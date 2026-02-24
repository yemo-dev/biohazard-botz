# Biohazard Botz - Advanced WhatsApp Framework

Biohazard Botz is a high-performance, modular WhatsApp bot framework built using the `yemo-dev/yebails` library. It focuses on stability, connection longevity, and a powerful plugin-based architecture for effortless expansion.

## Key Features

- **High Speed Performance**: Engineered for rapid message processing and minimal latency.
- **Plug-and-Play System**: Add or remove features instantly by dropping files into the `plugins/` directory.
- **Advanced Owner Controls**: Built-in commands to toggle global bot accessibility (`.self` / `.public`).
- **Persistent Connection**: Intelligent auto-reconnection and session state management.
- **Professional Logs**: Clean terminal output with categorized logging systems.

---

## Installation & Setup

Get your bot operational in three simple steps.

### 1. Clone and Install dependencies

```bash
git clone https://github.com/yemo-dev/biohazard-botz.git
cd biohazard-botz
npm install
```

### 2. Configure System

Modify `src/config.js` to set your primary parameters:

- **ownerNumbers**: Your WhatsApp ID for admin privileges.
- **prefixes**: Command triggers (e.g., `.` or `!`).
- **logChats**: Toggle terminal message visibility.

### 3. Launch

```bash
npm start
```

*Link your device using the pairing code displayed in the terminal.*

---

## Technical Core

- **`index.js`**: Primary orchestrator and socket engine.
- **`src/handler.js`**: Command router and message parser.
- **`src/config.js`**: Global configuration management.
- **`plugins/`**: Feature-rich ecosystem for all bot commands.
- **`src/utils/`**: Internal utilities and visual loggers.
