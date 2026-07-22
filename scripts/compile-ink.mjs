import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(root, 'story/main.ink');
const outputPath = resolve(root, 'public/story/main.json');
const textCatalogPath = resolve(root, 'public/story/line-text.json');
const storyDirectory = resolve(root, 'story');

async function listInkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listInkFiles(path);
    return entry.isFile() && entry.name.endsWith('.ink') ? [path] : [];
  }));
  return nested.flat();
}

async function normalizeDialogueDashes() {
  const files = await listInkFiles(storyDirectory);
  let changedFiles = 0;

  for (const path of files) {
    const source = await readFile(path, 'utf8');
    const lines = source.split('\n');
    let waitingForDialogueText = false;
    let changed = false;

    const normalized = lines.map((line) => {
      const trimmed = line.trim();
      if (/^#\s*layer:dialogue\s*$/.test(trimmed)) {
        waitingForDialogueText = true;
        return line;
      }
      if (!waitingForDialogueText || trimmed === '' || trimmed.startsWith('#')) return line;

      waitingForDialogueText = false;
      if (/^(\s*)\\-\s+/.test(line) || !/^(\s*)-\s+/.test(line)) return line;
      changed = true;
      return line.replace(/^(\s*)-\s+/, '$1\\- ');
    }).join('\n');

    if (changed) {
      await writeFile(path, normalized, 'utf8');
      changedFiles += 1;
    }
  }

  if (changedFiles > 0) {
    console.log(`Escaped dialogue hyphens in ${changedFiles} Ink file(s).`);
  }
}

async function writeLineTextCatalog() {
  const files = (await listInkFiles(storyDirectory)).sort();
  const lines = {};
  const revisionHash = createHash('sha256');

  for (const path of files) {
    const source = await readFile(path, 'utf8');
    revisionHash.update(path);
    revisionHash.update('\0');
    revisionHash.update(source);
    revisionHash.update('\0');

    const sourceLines = source.split(/\r?\n/);
    let pendingLineId = null;
    for (const sourceLine of sourceLines) {
      const trimmed = sourceLine.trim();
      const lineTag = trimmed.match(/^#\s*line\s*:\s*(.+)$/i);
      if (lineTag) {
        pendingLineId = lineTag[1].trim();
        continue;
      }
      if (!pendingLineId || trimmed === '' || trimmed.startsWith('#')) continue;

      // A line id always belongs to the next Ink content line. Structural
      // syntax here means the source is malformed; leave validation to the
      // story validator instead of recording control flow as visible prose.
      if (/^(?:~|\+|\*|->|===|VAR\b|\{|\})/.test(trimmed)) {
        pendingLineId = null;
        continue;
      }

      lines[pendingLineId] = trimmed.replace(/^\\-\s*/, '- ');
      pendingLineId = null;
    }
  }

  await writeFile(textCatalogPath, `${JSON.stringify({
    revision: revisionHash.digest('hex').slice(0, 16),
    lines,
  })}\n`, 'utf8');
}

async function compileInk() {
  await mkdir(dirname(outputPath), { recursive: true });
  await normalizeDialogueDashes();

  try {
    await execFileAsync('npx', ['inkjs-compiler', '-o', outputPath, inputPath], {
      cwd: root,
      env: process.env,
    });
    await writeLineTextCatalog();
    console.log(`Ink compiled: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    const message = error && typeof error === 'object' && 'stderr' in error
      ? String(error.stderr)
      : error instanceof Error ? error.message : String(error);
    console.error('Ink compilation failed.');
    console.error(message);
    process.exitCode = 1;
  }
}

compileInk();
