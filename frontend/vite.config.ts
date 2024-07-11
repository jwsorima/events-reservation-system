import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      '@emotion/react', 
      '@emotion/styled', 
      '@mui/material/Tooltip'
    ],
  },
  plugins: [
    {
      name: 'move-scripts-to-body',
      transformIndexHtml(html: string): string {
        // Extract all <script> tags from the <head>
        const scriptTags: string[] = [];
        const updatedHtml = html.replace(/<head>([\s\S]*?)<\/head>/, (match, headContent) => {
          // Capture <script> tags and remove them from the head content
          const cleanedHeadContent = headContent.replace(/<script[\s\S]*?<\/script>/g, (scriptTag: string) => {
            scriptTags.push(scriptTag);
            return '';
          });
          return `<head>${cleanedHeadContent}</head>`;
        });

        // Insert the <script> tags before the closing </body> tag
        const finalHtml = updatedHtml.replace('</body>', `${scriptTags.join('\n')}</body>`);
        return finalHtml;
      }
    },
    react(), 
    svgr(),
  ],
  build: {
    cssCodeSplit: true,
    minify: true,
    rollupOptions: {
        output:{
            manualChunks(id) {
                if (id.indexOf('node_modules') !== -1) {
                    return id.toString().split('node_modules/')[1].split('/')[0].toString();
                }
            }
        }
    }
  }
})
