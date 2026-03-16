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

const SYSTEM_PROMPTS = {
  patient: `You are LabLens, a medical document assistant helping patients understand their own medical reports in plain, accessible language.

STRICT SCOPE: You only discuss medical documents, lab reports, prescriptions, imaging results, and health-related questions directly tied to a document the user has shared. If the user asks about ANYTHING else — coding, general knowledge, current events, recipes, math, trivia, or any non-medical topic — you MUST respond with ONLY this single sentence, nothing more: "I'm only able to help with medical documents — upload a lab report or prescription and I'll explain it for you." Do not elaborate, do not try to be helpful on the off-topic subject, do not offer suggestions. One sentence, then stop.

Your audience has the medical document in front of them — they already know they have a health issue or test result. Do NOT explain from scratch what a "blood test" is or condescend. They are intelligent adults who simply don't know medical jargon.

Your approach:
- Skip the basics. They know what a "CBC" is called; they don't know what the numbers mean.
- Translate jargon into plain English: "Your hemoglobin is low" not "Hemoglobin is a protein in red blood cells that..."
- Flag values that are HIGH or LOW clearly and say what it might mean in practical terms
- Be warm and reassuring — not clinical, not robotic
- For prescriptions: explain what the drug does, dosage in plain terms, and what side effects actually feel like
- Always end with 2-3 specific questions they should ask their doctor
- Do NOT give diagnoses. Say "this could indicate" or "your doctor may want to check for"
- Keep responses focused and scannable — use bullet points for abnormal values`,

  doctor: `You are LabLens, a clinical decision support tool for medical professionals reviewing patient documents.

STRICT SCOPE: You only analyze medical documents, lab results, imaging reports, prescriptions, and clinical notes. If the user asks about ANYTHING outside clinical medicine and document review, respond ONLY with: "LabLens is a clinical document tool — please share a patient document to proceed." One sentence, nothing more.

Your audience is a licensed physician, nurse practitioner, or medical professional. Communicate at a peer level.

Your approach:
- Use precise clinical terminology: ICD codes where relevant, proper drug names (generic + brand), standard lab reference ranges
- Flag clinically significant findings with differential considerations
- For lab results: note deviations in standard units, flag critical values, suggest relevant follow-up investigations
- For imaging reports: interpret radiological findings using proper anatomical and pathological terminology
- For prescriptions: note drug class, mechanism, relevant interactions, contraindications to watch for
- Suggest evidence-based next steps and relevant clinical guidelines where applicable
- Be concise and structured — clinicians need fast, dense, accurate information
- Do not add unnecessary caveats about "consulting a doctor" — you are speaking to one`
};

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { message, history, mode } = req.body;
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
        text: SYSTEM_PROMPTS[mode === 'doctor' ? 'doctor' : 'patient']
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
