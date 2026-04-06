# NovaLens - Visual Intelligence Platform

NovaLens is a multi-turn visual analysis platform powered by **Amazon Nova 2 Lite** on AWS Bedrock. Upload any image — charts, diagrams, screenshots, documents, or photos — and have an intelligent conversation about what you see.

## Features

- **Multi-turn conversations** — Ask follow-up questions and dig deeper into details
- **Drag-and-drop uploads** — Intuitive image ingestion with live preview
- **Real-time streaming** — Responses stream token-by-token via Server-Sent Events
- **Enterprise-ready use cases** — Data analysis, document review, diagram comprehension
- **Multiple image formats** — JPEG, PNG, GIF, WebP up to 20MB

## Architecture

```
Browser (React 19 + Vite + Tailwind CSS)
       | HTTP + SSE
Express.js (Node.js)
       | AWS SDK v3
Amazon Nova 2 Lite (Bedrock, us-east-1)
```

## Quick Start

```bash
# Install everything and build frontend
npm run setup

# Start the server
npm start
# -> http://localhost:3000
```

Requires AWS credentials with Bedrock access configured via `aws configure` or IAM role.

## Tech Stack

- **Runtime**: Node.js
- **Backend**: Express.js, AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`)
- **Frontend**: React 19, Vite, Tailwind CSS
- **AI Model**: Amazon Nova 2 Lite (`us.amazon.nova-2-lite-v1:0`)
- **Deployment**: AWS EC2

## Project Structure

```
novalens/
├── server/
│   └── index.js           # Express + Bedrock streaming API
├── client/
│   ├── src/
│   │   ├── App.jsx         # Root state management + SSE reader
│   │   └── components/     # Header, ImageUploader, Chat, Messages
│   ├── index.html
│   └── vite.config.js
└── deploy/
    └── userdata.sh         # EC2 bootstrap script
```

## How It Works

1. User uploads an image (drag-and-drop or file picker)
2. User asks a question about the image in the chat interface
3. The image is base64-encoded and sent alongside the text query to Amazon Nova 2 Lite via AWS Bedrock
4. Nova analyzes the visual content and streams back a response using SSE
5. Users can ask follow-up questions in the same conversation with full context retention

## Deployment

The `deploy/userdata.sh` script automates EC2 setup:
- Installs Node.js and PM2
- Clones the repo and builds the frontend
- Starts the server with PM2 process management
- Redirects port 80 to 3000 via iptables

## Hackathon

Built for the **Amazon Nova AI Hackathon** — Multimodal Understanding category.
