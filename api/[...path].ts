import type { Request, Response } from 'express';
import app from '../server/app.ts';

// Catch-all Vercel Serverless Function entrypoint for /api/* subpaths
export default function handler(req: Request, res: Response) {
  // If req.url is already a valid /api path, pass directly to app
  if (req.url && req.url.startsWith('/api')) {
    return app(req, res);
  }

  const originalUrl = req.url || '/';
  const queryIndex = originalUrl.indexOf('?');
  const pathOnly = queryIndex !== -1 ? originalUrl.substring(0, queryIndex) : originalUrl;
  const queryString = queryIndex !== -1 ? originalUrl.substring(queryIndex) : '';

  let normalizedPath = pathOnly;
  const matchedPath = (req.headers['x-matched-path'] as string) || '';
  if (matchedPath && matchedPath.startsWith('/api')) {
    normalizedPath = matchedPath;
  } else if (req.query && req.query.path) {
    const rawPath = req.query.path;
    const subpath = Array.isArray(rawPath) ? rawPath.map(String).join('/') : typeof rawPath === 'string' ? rawPath : '';
    if (subpath) {
      normalizedPath = `/api/${subpath}`;
    }
  }

  if (!normalizedPath.startsWith('/api')) {
    normalizedPath = `/api${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  }

  req.url = `${normalizedPath}${queryString}`;
  return app(req, res);
}

