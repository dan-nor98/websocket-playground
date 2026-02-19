# WebSocket Playground

A WebSocket testing tool with a built-in proxy server for debugging matching engine connections. Features a clean dark-themed UI, loose JSON support, message history, and Burp Suite integration.

## Features

### 🚀 Core Features
- **WebSocket Proxy Server** – Connect to any WebSocket endpoint via URL parameter
- **Loose JSON Support** – Write JSON without quotes and with comments
- **Built-in Templates** – Common message patterns (Ping, Auth, etc.)
- **Message History** – Auto-save last 100 sent messages
- **Custom Templates** – Save and reuse your own message templates
- **Export/Import** – Backup your sessions and templates

### 🎨 UI Features
- Dark theme with GitHub-inspired color scheme
- Real-time connection status
- Sent/Received message counters
- Response time tracking
- Message filtering (All/Sent/Received/System)
- JSON syntax highlighting
- Keyboard shortcuts

### 🔧 Proxy Features
- Forward WebSocket connections to any target
- Burp Suite integration for traffic interception
- Environment-based configuration
- Graceful connection cleanup

## Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install ws http-proxy-agent https-proxy-agent
```

3. Start the server:
```bash
node server.js
```

4. Open http://localhost:9000 in your browser

## Usage

### Basic Usage
1. Enter your target WebSocket URL in the connection bar
2. Click "Connect"
3. Write your message in the composer
4. Click "Send" or press `Ctrl+Enter`

### URL Format
The proxy accepts a `target` parameter:
```
ws://localhost:9000?target=ws://192.168.90.7:10100/ws
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Ctrl+Shift+F` | Format JSON |
| `Ctrl+Shift+X` | Clear input |
| `Ctrl+Shift+C` | Connect/Disconnect |
| `Esc` | Close modal |

### Burp Suite Integration
Enable Burp proxy by setting environment variables:
```bash
USE_BURP=true BURP_PROXY=http://127.0.0.1:8080 node server.js
```

## Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | 9000 |
| `USE_BURP` | Enable Burp proxy | false |
| `BURP_PROXY` | Burp proxy URL | http://127.0.0.1:8080 |

## Features in Detail

### Message Templates
- **Built-in templates**: Ping, Auth Request
- **Custom templates**: Save any message with name, category, and description
- **Search**: Filter templates by name, category, or content

### History Management
- Automatically saves last 100 sent messages
- Search through history
- Click any history item to load into composer
- Clear history button

### Export/Import
Export your session data (messages, templates, history) as JSON:
- Copy to clipboard
- Download as file
- Import later via the UI

### Connection Info Panel
Real-time information about:
- Current URL
- Connection status
- Connection timestamp
- Message counters

## Development

### Running Locally
```bash
# Standard mode
node server.js

# With Burp integration
USE_BURP=true node server.js

# Custom port
PORT=8080 node server.js
```

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - feel free to use and modify for your needs.

## Acknowledgments

- Built with [ws](https://github.com/websockets/ws) WebSocket library
- Icons by [Font Awesome](https://fontawesome.com)
- Dark theme inspired by GitHub's color scheme
