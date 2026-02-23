# Biohazard Botz

A powerful and extensible WhatsApp bot built with Baileys (`yemo-dev/yebails`).

## Features

- **Dynamic Command Handler**: Easily add new commands in the `plugins/` directory.
- **Auto Session Cleanup**: Automatically removes unnecessary session files every 30 minutes while keeping you logged in.
- **Advanced Message Parsing**: Extract mimetypes, quoted messages, and group/sender info easily.
- **System Monitoring**: Detailed `!ping` command with OS, RAM, and Latency info.
- **Clean Logger**: Brighter, readable console output with Windows CMD support.
- **Configurable**: Toggle chat logs and manage bot settings in `src/config.js`.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yemo-dev/biohazard-botz.git
   cd biohazard-botz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the bot:
   Edit `src/config.js` to set your owner number and prefixes.

4. Start the bot:
   ```bash
   npm start
   ```

5. Link your account:
   Follow the pairing code instructions in the terminal.

## Usage

- Send `!ping` to check bot status.
- Add new plugins in the `plugins/` folder to expand functionality.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
