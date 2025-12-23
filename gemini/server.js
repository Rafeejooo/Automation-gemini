const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('[INIT] Starting server...');

// ==== EXPRESS APP ====
const app = express();

// ==== CORS - ALLOW ALL ORIGINS ====
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));

// ==== LOG ALL REQUESTS ====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==== HARD KEEP-ALIVE (ANTI NODE EXIT) ====
setInterval(() => {
  // keep event loop alive
}, 1000);

// ==== GLOBAL SAFETY NET ====
process.on('uncaughtException', err => {
  console.error('🔥 UNCAUGHT EXCEPTION');
  console.error(err);
});

process.on('unhandledRejection', err => {
  console.error('🔥 UNHANDLED PROMISE');
  console.error(err);
});

process.on('exit', code => {
  console.log('❌ PROCESS EXITED WITH CODE:', code);
});

// ==== LOAD GEMINI ====
// NOTE: Update this path to match your actual gemini module location
let runGemini;
try {
  ({ runGemini } = require('../../playwright/tests/gemini'));
  console.log('[INIT] runGemini loaded successfully');
} catch (err) {
  console.error('[INIT] Failed to load gemini module:', err.message);
  console.error('[INIT] Please check the path: ../../playwright/tests/gemini');
  // Fallback function
  runGemini = async (text, images) => {
    throw new Error('Gemini module not loaded. Please check the require path.');
  };
}

app.post('/consult', async (req, res) => {
  console.log('[SERVER] ========== /consult hit ==========');
  console.log('[SERVER] Headers:', req.headers);
  console.log('[SERVER] Body:', JSON.stringify(req.body).substring(0, 200));

  let imagePaths = [];

  try {
    const { text = '', images = [] } = req.body;

    console.log('[SERVER] Text length:', text?.length || 0);
    console.log('[SERVER] Images count:', images?.length || 0);

    // SAVE IMAGES
    imagePaths = images.map((img, i) => {
      const base64 = img.data.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');

      const p = path.join(__dirname, `tmp_${Date.now()}_${i}.png`);
      fs.writeFileSync(p, buffer);
      return p;
    });

    console.log('[SERVER] Calling runGemini...');
    const answer = await runGemini(text, imagePaths);
    console.log('[SERVER] Answer received:', answer.substring(0, 100));

    res.json({ answer });

  } catch (err) {
    console.error('🔥 ERROR in /consult');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  } finally {
    // CLEANUP
    imagePaths.forEach(p => {
      try { fs.unlinkSync(p); } catch {}
    });
  }
});

// ==== LISTEN (IMPORTANT) ====
const server = app.listen(4000, () => {
  console.log('✅ Backend running on http://localhost:4000');
});

// ==== EXTRA GUARANTEE ====
server.on('close', () => {
  console.log('❌ SERVER CLOSED');
});
