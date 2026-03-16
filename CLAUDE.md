# NovaLens — CLAUDE.md

## Project Overview
NovaLens is a multimodal visual intelligence platform for the Amazon Nova AI Hackathon (Multimodal Understanding category). Users upload images and have multi-turn conversations powered by Amazon Nova 2 Lite.

## Critical Technical Notes

### Amazon Nova 2 Lite API
- **Model ID:** `us.amazon.nova-2-lite-v1:0` (inference profile — NOT foundation model ID)
- **Bedrock Region:** `us-east-1` (inference profiles are us-east-1 only)
- **Schema version:** `messages-v1` (NOT `anthropic_version`)
- **Token param:** `max_new_tokens` (NOT `max_tokens`)
- **Streaming event path:** `decoded.contentBlockDelta.delta.text`
- **End signal:** `decoded.messageStop`

### Image Handling
- Images are sent as base64 in the first message only
- Subsequent messages use text-only content (history carries context)
- The image `bytes` field takes base64 string (not Buffer)

### EC2 Infrastructure
- Region: us-east-2 (EC2), us-east-1 (Bedrock)
- VPC: vpc-0c759af7a4181c58c
- Subnet: subnet-000bab9b048ac52ae
- Key Pair: n8n-key-pair
- IAM Role: novalens-ec2-role (needs bedrock:InvokeModel, bedrock:InvokeModelWithResponseStream)
- Port routing: iptables 80 → 3000

### GitHub
- Repo: https://github.com/HAR5HA-7663/novalens

## Lessons Learned
- Always use inference profile IDs (prefixed with `us.`) for Nova models — foundation model IDs fail
- Bedrock streaming chunks come via `chunk.chunk.bytes` as Uint8Array, decode with Buffer.from().toString('utf-8')
- Express 5 handles async errors natively, no need for express-async-errors
- Multer 2 with memoryStorage works well for base64 conversion
- Tailwind CSS v4 uses `@tailwind base/components/utilities` (not `@import "tailwindcss"`)
