import type { Request, Response } from 'express';
import app from '../server/app.ts';

// Standard Vercel Serverless Function entrypoint
export default function handler(req: Request, res: Response) {
  const matchedPath = (req.headers['x-matched-path'] as string) || '';
  if (matchedPath && matchedPath.startsWith('/api') && req.url !== matchedPath) {
    req.url = matchedPath;
  } else if (req.query && req.query.path) {
    const rawPath = req.query.path;
    const subpath = Array.isArray(rawPath) ? rawPath.map(String).join('/') : typeof rawPath === 'string' ? rawPath : '';
    if (subpath && !req.url.includes(subpath)) {
      req.url = `/api/${subpath}`;
    }
  }

  // Ensure req.url begins with /api for Express routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}

