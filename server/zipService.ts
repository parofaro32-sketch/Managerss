import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const ROOT_DIR = process.cwd();
const DOWNLOADS_DIR = path.join(ROOT_DIR, 'public', 'downloads');
const ZIP_OUTPUT_PATH = path.join(DOWNLOADS_DIR, 'manager-nol-project.zip');

export function ensureDownloadsDir(): void {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
}

function addDirectoryToZip(zip: JSZip, localDir: string, zipPrefix: string, ignores: string[] = []): void {
  if (!fs.existsSync(localDir)) return;
  const entries = fs.readdirSync(localDir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignores.includes(entry.name)) continue;
    const fullPath = path.join(localDir, entry.name);
    const zipPath = zipPrefix ? `${zipPrefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      addDirectoryToZip(zip, fullPath, zipPath, ignores);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath);
      zip.file(zipPath, content);
    }
  }
}

export async function buildProjectZip(): Promise<string> {
  ensureDownloadsDir();
  const zip = new JSZip();

  // 1. Root files
  const rootFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    'server.ts',
    'metadata.json',
    '.env.example',
    '.gitignore',
    'README.md',
  ];

  for (const fileName of rootFiles) {
    const fullPath = path.join(ROOT_DIR, fileName);
    if (fs.existsSync(fullPath)) {
      zip.file(fileName, fs.readFileSync(fullPath));
    }
  }

  // 2. Directories
  addDirectoryToZip(zip, path.join(ROOT_DIR, 'src'), 'src', ['node_modules', '.git']);
  addDirectoryToZip(zip, path.join(ROOT_DIR, 'server'), 'server', ['node_modules', '.git']);
  addDirectoryToZip(zip, path.join(ROOT_DIR, 'public'), 'public', ['downloads']);

  // 3. Generate archive buffer
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(ZIP_OUTPUT_PATH, buffer);
  console.log(`[ZIP Service] Archive created successfully: ${buffer.length} total bytes at ${ZIP_OUTPUT_PATH}`);

  return ZIP_OUTPUT_PATH;
}

export function getZipPath(): string {
  return ZIP_OUTPUT_PATH;
}
