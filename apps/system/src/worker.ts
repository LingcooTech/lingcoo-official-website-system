#!/usr/bin/env node

import { createFrameWorker, loadEnv } from '@lingcootech/frame';

import { officialSystem } from './system.js';

const worker = createFrameWorker(loadEnv(), { system: officialSystem });

process.on('SIGTERM', () => void worker.stop('SIGTERM'));
process.on('SIGINT', () => void worker.stop('SIGINT'));

try {
  await worker.run();
} catch {
  process.exitCode = 1;
}
