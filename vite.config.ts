import { defineConfig } from 'vite';
import process from 'node:process';
import fs from 'node:fs/promises';

const readDefine = async (subPath: string): Promise<string> => {
  return fs
    .readFile(process.cwd() + subPath, 'utf-8')
    .then((r) => JSON.stringify(r.trimEnd().replaceAll('\r\n', '\n')));
};

export default defineConfig({
  define: {
    __INNER_DOMAIN__: await readDefine('/config/inner-domain.txt'),
    __INNER_PROXY_DOMAIN__: await readDefine('/config/inner-proxy-domain.txt'),
  },
  build: {
    minify: false,
    target: 'es2015',
    lib: {
      entry: './src/index.ts',
      formats: ['iife'],
      name: 'main',
    },
  },
});
