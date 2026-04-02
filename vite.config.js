import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const DOCX_URLS = {
  '/api/docx': 'https://filedn.com/lvSV5gd3xgHzmshlytr2p5J/promptbibliotheek002.docx',
  '/api/docx-auteur': 'https://filedn.com/lvSV5gd3xgHzmshlytr2p5J/overdeauteur-trainingsoverzicht.docx',
};

function devApiProxy() {
  return {
    name: 'dev-api-proxy',
    configureServer(server) {
      for (const [route, url] of Object.entries(DOCX_URLS)) {
        server.middlewares.use(route, async (req, res) => {
          try {
            const response = await fetch(`${url}?t=${Date.now()}`, {
              headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
            });
            if (!response.ok) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Failed: ${response.status}` }));
              return;
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            res.writeHead(200, {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Cache-Control': 'no-store',
            });
            res.end(buffer);
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4000,
  },
});
