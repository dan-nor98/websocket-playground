'use strict';

const http = require('http');
const WebSocket = require('ws');
const path = require("path");
const fs = require("fs");
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

// ===============================
// Configuration
// ===============================

const LISTEN_PORT = process.env.PORT || 9000;
const USE_BURP = process.env.USE_BURP === 'true';
const BURP_PROXY = process.env.BURP_PROXY || 'http://127.0.0.1:8080';

// ===============================
// HTTP Server (for upgrade)
// ===============================

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const filePath = path.join(__dirname, "index.html");

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const wss = new WebSocket.Server({ noServer: true });

// ===============================
// Utility: Create Upstream WS
// ===============================

function createUpstreamConnection(targetUrl) {
  if (!targetUrl) {
    throw new Error('Missing target WebSocket URL');
  }

  if (!USE_BURP) {
    return new WebSocket(targetUrl);
  }

  const isSecure = targetUrl.startsWith('wss://');
  const agent = isSecure
    ? new HttpsProxyAgent(BURP_PROXY)
    : new HttpProxyAgent(BURP_PROXY);

  return new WebSocket(targetUrl, { agent });
}

// ===============================
// Connection Handling
// ===============================

wss.on('connection', (clientWs, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const target = url.searchParams.get('target');

  if (!target) {
    clientWs.send(JSON.stringify({ error: 'Missing ?target=ws://host:port/path' }));
    clientWs.close();
    return;
  }

  console.log(`Client connected → Target: ${target}`);

  let upstream;

  try {
    upstream = createUpstreamConnection(target);
  } catch (err) {
    console.error('Upstream creation failed:', err.message);
    clientWs.close();
    return;
  }

  // ---- Upstream Open ----
  upstream.on('open', () => {
    console.log(`Upstream connected: ${target}`);
  });

  // ---- Upstream → Client ----
  upstream.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  // ---- Client → Upstream ----
  clientWs.on('message', (data) => {
    if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(data);
    }
  });

  // ---- Close Handling ----
  const closeBoth = () => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    if (upstream.readyState === WebSocket.OPEN) upstream.close();
  };

  clientWs.on('close', () => {
    console.log('Client disconnected');
    closeBoth();
  });

  upstream.on('close', () => {
    console.log('Upstream disconnected');
    closeBoth();
  });

  clientWs.on('error', (err) => {
    console.error('Client error:', err.message);
  });

  upstream.on('error', (err) => {
    console.error('Upstream error:', err.message);
  });
});

// ===============================
// Upgrade HTTP → WebSocket
// ===============================

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// ===============================
// Start Server
// ===============================

server.listen(LISTEN_PORT, () => {
  console.log('===================================');
  console.log(' WebSocket Proxy Server Running');
  console.log(' Listening on port:', LISTEN_PORT);
  console.log(' Burp enabled:', USE_BURP);
  if (USE_BURP) {
    console.log(' Burp proxy:', BURP_PROXY);
  }
  console.log('===================================');
});

// ===============================
// Graceful Shutdown
// ===============================

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});

