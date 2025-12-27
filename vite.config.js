import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/3D_Portfolio/' : '',
  plugins: [react(), viteStaticCopy({
    targets: [
      // copia src/assets/molly -> dist/assets/molly
      { src: 'src/assets/molly', dest: 'assets' }
    ]
  })
  ],
}));