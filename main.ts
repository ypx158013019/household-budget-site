import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Locate the sources beside this program even when it is run from another directory.
const root = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
mkdirSync(out, { recursive: true });

cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
const screenshots = join(root, 'screenshots');
if (existsSync(screenshots)) {
  cpSync(screenshots, join(out, 'screenshots'), { recursive: true });
}

// Build the dossier from the copied files so its contents match the hand-in.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(out, 'dossier.json'), dossier);
