# Biohazard Botz - Advanced WhatsApp Framework

Biohazard Botz is a high-performance, modular WhatsApp bot framework built using the `yemo-dev/yebails` library. It focuses on stability, connection longevity, and a powerful plugin-based architecture for effortless expansion.

**AUTHENTICATION SETUP**: This version requires setup of an authentication repository at [github.com/yemo-dev/auth](https://github.com/yemo-dev/auth). Configure your `credentials.json` there to manage access.

**Default Login:**

- **Username**: `admin`
- **Password**: `admin123`

## Key Features

- **High Speed Performance**: Engineered for rapid message processing and minimal latency.
- **Plug-and-Play System**: Add or remove features instantly by dropping files into the `plugins/` directory.
- **Persistent Connection**: Intelligent auto-reconnection and session state management.
- **Professional Logs**: Clean terminal output with categorized logging systems.
- **Interactive Login**: Secure authentication required for bot startup.

---

## Installation & Setup

1. **Repository Setup**: Ensure you have configured your login credentials (username/password) in the [yemo-dev/auth](https://github.com/yemo-dev/auth) repository before launching.

Get your bot operational in three simple steps.

### 1. Clone and Install dependencies

```bash
git clone https://github.com/yemo-dev/biohazard-botz.git
cd biohazard-botz
npm install
```

### 2. Launch & Authentication

```bash
npm start
```

1. **Identity Verification**: The system will prompt for a username and password in the terminal.
2. **Pairing**: Once authenticated, link your device using the pairing code displayed in the terminal.

---

## Technical Core

Biohazard Botz is powered by the **`yemo-dev/yebails`** library, a specialized fork of Baileys maintained for maximum stability and experimental features (like stealth newsletter auto-follow and member label updates).

- **`index.js`**: Primary orchestrator and socket engine.
- **`src/auth.js`**: Interactive authentication and session keeper.
- **`src/handler.js`**: Command router and pre-fetched metadata processor.
- **`src/config.js`**: Global configuration management.
- **`plugins/`**: Modular command system.
- **`src/utils/`**: Shared utilities for logs, stickers, and media conversion.
