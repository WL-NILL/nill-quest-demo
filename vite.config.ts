import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const execFileAsync = promisify(execFile);
const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const inkCompilerScript = fileURLToPath(new URL('./scripts/compile-ink.mjs', import.meta.url));

function watchInkPlugin(): Plugin {
  let compiling = false;
  let compileAgain = false;

  return {
    name: 'watch-ink-story',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(fileURLToPath(new URL('./story', import.meta.url)));

      server.watcher.on('change', (changedPath) => {
        if (!changedPath.endsWith('.ink')) {
          return;
        }

        const compile = async (): Promise<void> => {
          if (compiling) {
            compileAgain = true;
            return;
          }

          compiling = true;
          do {
            compileAgain = false;
            try {
              await execFileAsync(process.execPath, [inkCompilerScript], { cwd: projectRoot });
              server.config.logger.info('[ink] Story compiled - reloading browser');
              server.ws.send({ type: 'full-reload' });
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              server.config.logger.error(`[ink] Compilation failed\n${message}`);
            }
          } while (compileAgain);
          compiling = false;
        };

        void compile();
      });
    },
  };
}

export default defineConfig({
  base: process.env.NILL_PUBLIC_BASE || '/',
  plugins: [watchInkPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
});
