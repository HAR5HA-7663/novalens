import express from 'express';
import multer from 'multer';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const MODEL_ID = 'us.amazon.nova-2-lite-v1:0';
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

app.use(express.json());

// Serve React build
const clientDist = join(__dirname, '../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL_ID, timestamp: new Date().toISOString() });
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { message, history } = req.body;
    const imageFile = req.file;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation history
    let parsedHistory = [];
    try {
      parsedHistory = JSON.parse(history || '[]');
    } catch {
      parsedHistory = [];
    }

    // Build current user message content
    const userContent = [];

    // Add image if provided
    if (imageFile) {
      const base64Image = imageFile.buffer.toString('base64');
      const mimeType = imageFile.mimetype;
      const format = mimeType === 'image/png' ? 'png'
        : mimeType === 'image/gif' ? 'gif'
        : mimeType === 'image/webp' ? 'webp'
        : 'jpeg';

      userContent.push({
        image: {
          format,
          source: { bytes: base64Image }
        }
      });
    }

    userContent.push({ text: message });

    // Build messages array with history
    const messages = [];

    // Add history (filter to valid roles)
    for (const msg of parsedHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: [{ text: msg.content }]
        });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: userContent });

    const requestBody = {
      schemaVersion: 'messages-v1',
      messages,
      system: [{
        text: `You are NovaLens, an expert visual intelligence assistant. You help users understand images including charts, dashboards, documents, diagrams, and screenshots through natural conversation.

When analyzing images:
- Be specific and detailed about what you observe
- For charts/graphs: describe trends, data points, axes, and key insights
- For documents: summarize content and highlight important information
- For diagrams: explain structure, relationships, and flow
- For screenshots: identify UI elements, errors, or relevant information
- Always provide actionable insights when relevant

You maintain context across the conversation, so users can ask follow-up questions about the same image.`
      }],
      inferenceConfig: {
        max_new_tokens: 1024,
        temperature: 0.7
      }
    };

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await bedrock.send(command);

    for await (const chunk of response.body) {
      if (chunk.chunk?.bytes) {
        const decoded = JSON.parse(Buffer.from(chunk.chunk.bytes).toString('utf-8'));

        if (decoded.contentBlockDelta?.delta?.text) {
          const text = decoded.contentBlockDelta.delta.text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }

        if (decoded.messageStop) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          break;
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('Analyze error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
  }
});

// SPA fallback
app.get('/{*path}', (req, res) => {
  const indexPath = join(clientDist, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Client not built. Run: cd client && npm run build' });
  }
});

app.listen(PORT, () => {
  console.log(`NovaLens server running on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL_ID}`);
});
