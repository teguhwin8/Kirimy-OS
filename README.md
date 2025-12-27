# 🚀 KirimyOS

**Open Source WhatsApp Gateway** built with NestJS, Next.js, and Baileys.
Designed for stability with Queue System (Redis/BullMQ) and Realtime QR (WebSocket).

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-22-green)

## 🔥 Features

- **Monorepo Architecture** (NestJS + Next.js)
- **Queue System** (Anti-Banned & High Concurrency)
- **Realtime QR Code** (WebSocket Integration)
- **Docker Ready** (Just one command to run)
- **REST API** for sending messages

## 🛠️ Tech Stack

- **Backend:** NestJS, Socket.io, BullMQ
- **Frontend:** Next.js 16 (App Router), TailwindCSS
- **Infra:** Docker, Redis, PostgreSQL
- **Core:** @whiskeysockets/baileys

## 🏃‍♂️ Quick Start (Docker)

1. **Clone Repo**

   ```bash
   git clone [https://github.com/teguhwin8/Kirimy-OS.git](https://github.com/teguhwin8/Kirimy-OS.git)
   cd Kirimy-OS
   ```

2. **Run Everything**

   ```bash
   docker-compose up -d
   ```

3. **Access**

- **Dashboard (Scan QR):** [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001)
- **API Endpoint:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

## 📡 API Usage

**Send Text Message**

```bash
curl -X POST http://localhost:3000/message/send \
   -H "Content-Type: application/json" \
   -d '{"to": "6281234567890", "message": "Hello from KirimyOS!"}'

```

## 🤝 Contributing

Pull requests are welcome!

---

Created with ❤️ by [Teguh Coding](https://github.com/teguhwin8)
