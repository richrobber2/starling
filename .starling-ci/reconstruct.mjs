// Runs only in the isolated CI branch. Public baseline is fetched separately.
import { readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
const root = resolve('.starling-ci'), context = join(root, 'context');
const expected = (await readFile(join(root, 'overlay.sha256'), 'utf8')).trim();
if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('Invalid source checksum');
const parts = (await readdir(join(root, 'parts'))).sort();
if (!parts.length || parts.some(name => !/^part-\d{4}\.b64$/.test(name))) throw new Error('Unexpected overlay part');
const encoded = (await Promise.all(parts.map(name => readFile(join(root, 'parts', name), 'utf8')))).join('');
const source = Buffer.from(encoded, 'base64');
if (createHash('sha256').update(source).digest('hex') !== expected) throw new Error('Source overlay checksum mismatch');
const archive = join(root, 'overlay.tar.gz'); await writeFile(archive, source, { mode: 0o600 });
const paths = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8', maxBuffer: 16 << 20 }).trim().split('\n');
if (paths.some(path => path.startsWith('/') || path.split('/').includes('..'))) throw new Error('Unsafe overlay path');
execFileSync('tar', ['-xzf', archive, '-C', context]);
const deleted = JSON.parse(await readFile(join(context, '.ci-deletions.json'), 'utf8'));
for (const path of deleted) {
  if (typeof path !== 'string' || !path.startsWith('upstream/') || path.split('/').includes('..')) throw new Error('Unsafe source deletion');
  await rm(join(context, path), { force: true });
}
console.log('Reconstructed verified source overlay; no game assets or account credentials supplied.');
