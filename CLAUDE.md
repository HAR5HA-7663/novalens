# CLAUDE.md - NovaLens

## Project Overview
NovaLens: Visual Intelligence Platform using Amazon Nova 2 Lite on AWS Bedrock.
Multi-turn image analysis chat app. Node.js backend, React frontend.

## Quick Commands
```bash
npm run setup    # install deps + build frontend
npm start        # start server on :3000
npm run dev      # dev mode with file watching
```

## Architecture
- `server/index.js` — Express server, Bedrock streaming, multer uploads
- `client/` — React 19 + Vite + Tailwind CSS
- `deploy/userdata.sh` — EC2 bootstrap

## Key Technical Details
- Model ID: `us.amazon.nova-2-lite-v1:0` (inference profile, NOT foundation model ID)
- Bedrock region: `us-east-1`
- Schema: `schemaVersion: 'messages-v1'`
- Max tokens key: `max_new_tokens` (not `max_tokens`)
- Streaming events: `contentBlockDelta.delta.text` for chunks, `messageStop` for end
- Image format: `{ image: { format, source: { bytes: base64 } } }` — image before text in content array

## Lessons Learned
<!-- This section gets updated as issues are discovered and fixed -->

### API Issues
- Nova 2 Lite ONLY works via inference profiles. Using raw foundation model ID gives ValidationException.
- Must use `us.amazon.nova-2-lite-v1:0` not `amazon.nova-2-lite-v1:0`

### Frontend
- Tailwind v3 uses `@tailwind base/components/utilities`, v4 uses `@import "tailwindcss"`
- Using Tailwind v3.4 with PostCSS for stability

### Deployment
- EC2 needs IAM instance profile with bedrock:InvokeModel and bedrock:InvokeModelWithResponseStream
- Port 80 redirect via iptables (avoids running node as root)
- PM2 for process management and auto-restart

## Recurring Issues & Fixes
<!-- Add patterns here when the same problem appears more than once -->
