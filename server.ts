import express from 'express';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Serve static assets from public/ (such as 3D models and images)
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CardioVision AI Real ML Inference Service',
    dataset: 'Extension of Z-Alizadeh Sani Cardiovascular Dataset (UCI 411)',
    targets: ['Cath (Overall CAD)', 'LAD', 'LCX', 'RCA'],
    timestamp: new Date().toISOString()
  });
});

// Model Info & Validation Metrics endpoint
app.get('/api/model-info', (req, res) => {
  const artifactsPath = path.join(process.cwd(), 'src/data/trained_model_artifacts.json');
  if (fs.existsSync(artifactsPath)) {
    const data = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    res.json(data);
  } else {
    res.status(404).json({ error: 'Model artifacts not found' });
  }
});

// Real Prediction Endpoint (both /api/predict and /predict)
const handlePredict = (req: express.Request, res: express.Response) => {
  const patientData = req.body;

  if (!patientData || typeof patientData !== 'object' || Object.keys(patientData).length === 0) {
    return res.status(400).json({
      error: 'Invalid request: patientData must be a non-empty JSON object with clinical parameters.'
    });
  }

  // Execute Python inference pipeline
  const scriptPath = path.join(process.cwd(), 'scripts', 'predict.py');
  const child = execFile('python3', [scriptPath, JSON.stringify(patientData)], {
    timeout: 10000,
    maxBuffer: 1024 * 1024 * 5
  }, (err, stdout, stderr) => {
    if (err) {
      console.error('Python inference error:', stderr || err.message);
      return res.status(400).json({
        error: stderr ? stderr.trim() : err.message
      });
    }

    try {
      const output = JSON.parse(stdout);
      return res.json(output);
    } catch (parseError) {
      console.error('JSON parse error on python output:', stdout);
      return res.status(500).json({
        error: 'Failed to parse inference pipeline output',
        rawOutput: stdout
      });
    }
  });
};

app.post('/api/predict', handlePredict);
app.post('/predict', handlePredict);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CardioVision AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
