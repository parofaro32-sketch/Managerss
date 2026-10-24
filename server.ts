import express, { Request, Response } from 'express';
import path from 'node:path';
import app from './server/app.ts';
import { buildProjectZip } from './server/zipService.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// ----------------------------------------------------
// Frontend Mounting (Vite Middleware in Dev / Static in Prod)
// ----------------------------------------------------

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ Manager Nol Server listening on http://0.0.0.0:${PORT}`);
    // Pre-build ZIP in background so it's instantly available
    buildProjectZip().catch((e) => console.warn('Prebuild zip notice:', e.message));
  });
}

startServer();
