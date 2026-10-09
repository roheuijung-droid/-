import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxJduo_gmRPFgwNYOxnXMgwqWykxK9qbQJs8XSdWp5epsis_-_jbiIXjmw7yKTFF1Au/exec';

app.use(express.json());

// Proxy: Google Sheets Health Status Check
app.get('/api/health', async (_req, res) => {
  try {
    const targetUrl = new URL(APPS_SCRIPT_URL);
    targetUrl.searchParams.set('action', 'health');

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Google Apps Script 응답 오류 (HTTP ${response.status} ${response.statusText})`,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('API /api/health error:', error);
    return res.status(502).json({
      success: false,
      error: `Google Sheets 연결 확인 중 네트워크 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
    });
  }
});

// Proxy: Google Sheets Books Query
app.get('/api/books', async (_req, res) => {
  try {
    const targetUrl = new URL(APPS_SCRIPT_URL);
    targetUrl.searchParams.set('action', 'books');

    // Prevent caching stale sheets data
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Google Apps Script 응답 오류 (HTTP ${response.status} ${response.statusText})`,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('API /api/books error:', error);
    return res.status(502).json({
      success: false,
      error: `도서 목록을 불러오는 중 연결 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Library Server] Running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
