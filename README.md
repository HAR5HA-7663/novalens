# NovaLens — Visual Intelligence Platform

Upload images and have intelligent multi-turn conversations powered by **Amazon Nova 2 Lite** on AWS Bedrock.

## What It Does

NovaLens lets you upload any image — charts, dashboards, documents, diagrams, screenshots — and ask questions about it in natural language. Responses stream in real-time via Server-Sent Events.

**Use Cases:**
- Enterprise analysts interrogating chart data without specialized tools
- Researchers summarizing figure content from papers
- Support teams processing screenshot bug reports
- Educators analyzing diagram-based content

## Tech Stack

- **Backend:** Node.js 22, Express 5, AWS SDK v3, Multer 2
- **Frontend:** React 19, Vite 6, Tailwind CSS
- **AI:** Amazon Nova 2 Lite (`us.amazon.nova-2-lite-v1:0`) via AWS Bedrock
- **Deploy:** EC2 + PM2

## Local Development

### Prerequisites
- Node.js 22+
- AWS credentials with Bedrock access in `us-east-1`

### Setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend
cd client && npm run build && cd ..

# Start server
npm start
```

Open http://localhost:3000

### Development Mode

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend with hot reload
cd client && npm run dev
```

Frontend dev server runs on http://localhost:5173 with proxy to backend.

## AWS Configuration

The app uses the AWS SDK default credential chain. On EC2, it uses the instance IAM role. Locally, configure with:

```bash
aws configure
# or set environment variables:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
```

Required IAM permissions:
```json
{
  "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
  "Resource": "*"
}
```

## API

### `GET /api/health`
Returns server status.

### `POST /api/analyze`
Analyzes an image with a text query.

**Form fields:**
- `image` (file, optional after first message): Image file
- `message` (string, required): User's question
- `history` (JSON string): Array of `{role, content}` previous messages

**Response:** Server-Sent Events stream with `data: {"text": "..."}` chunks, ending with `data: {"done": true}`.

## Hackathon

**Amazon Nova AI Hackathon** — Multimodal Understanding category

Built with Amazon Nova 2 Lite accessed via AWS Bedrock inference profiles for real-time multimodal visual intelligence.
