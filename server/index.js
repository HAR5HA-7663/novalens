import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODEL_ID = 'us.amazon.nova-2-lite-v1:0';

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(express.static(join(__dirname, '../client/dist')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', model: MODEL_ID }));

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { message, history } = req.body;
    const imageFile = req.file;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const parsedHistory = history ? JSON.parse(history) : [];
    const messages = [];

    for (const turn of parsedHistory) {
      messages.push({
        role: turn.role,
        content: [{ text: turn.content }],
      });
    }

    const currentContent = [];

    if (imageFile) {
      const base64Image = imageFile.buffer.toString('base64');
      const mimeToFormat = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      currentContent.push({
        image: {
          format: mimeToFormat[imageFile.mimetype] || 'jpeg',
          source: {
            bytes: base64Image,
          },
        },
      });
    }

    currentContent.push({ text: message });

    messages.push({
      role: 'user',
      content: currentContent,
    });

    const requestBody = {
      schemaVersion: 'messages-v1',
      messages,
      system: [
        {
          text: `You are NovaLens, an expert visual intelligence assistant. Analyze images with precision and provide detailed, actionable insights. For charts and graphs, extract key data points and trends. For documents, summarize key information. For diagrams, explain the structure and relationships. For screenshots, describe what you see and identify UI elements, errors, or notable details. Be concise, clear, and professional. Use markdown formatting when helpful.`,
        },
      ],
      inferenceConfig: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
      },
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrock.send(command);

    let fullText = '';

    for await (const event of response.body) {
      if (event.chunk?.bytes) {
        const decoded = JSON.parse(
          Buffer.from(event.chunk.bytes).toString('utf-8')
        );

        if (decoded.contentBlockDelta?.delta?.text) {
          const text = decoded.contentBlockDelta.delta.text;
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
        }

        if (decoded.messageStop) {
          res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
          break;
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('Analysis error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    }
  }
});

app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NovaLens running on port ${PORT}`);
  console.log(`Using model: ${MODEL_ID}`);
});
