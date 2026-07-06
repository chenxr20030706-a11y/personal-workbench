import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { VitePWA } from 'vite-plugin-pwa'
import { HttpsProxyAgent } from 'https-proxy-agent';
import https from 'https';
import { URL } from 'url';

// 自定义代理中间件：通过环境代理访问 WeRead API
function wereadProxyPlugin() {
  return {
    name: 'weread-proxy',
    configureServer(server: any) {
      server.middlewares.use('/weread', async (req: any, res: any) => {
        const httpProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
        const target = 'https://i.weread.qq.com';

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const fullUrl = target + (req.url || '');
          const parsed = new URL(fullUrl);

          const headers: Record<string, string> = {};
          for (const [key, val] of Object.entries(req.headers)) {
            if (key !== 'host' && key !== 'connection' && typeof val === 'string') {
              headers[key] = val;
            }
          }

          const options: https.RequestOptions = {
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname + parsed.search,
            method: req.method || 'GET',
            headers,
          };

          if (httpProxy) {
            options.agent = new HttpsProxyAgent(httpProxy) as any;
          }

          const proxyReq = https.request(options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode || 502;
            for (const [key, val] of Object.entries(proxyRes.headers)) {
              if (key !== 'transfer-encoding' && key !== 'content-encoding' && val) {
                res.setHeader(key, val);
              }
            }
            const respChunks: Buffer[] = [];
            proxyRes.on('data', (chunk) => respChunks.push(chunk));
            proxyRes.on('end', () => {
              res.end(Buffer.concat(respChunks));
            });
          });

          proxyReq.on('error', (err) => {
            console.error('WeRead proxy error:', err.message);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
          });

          if (body.length > 0) {
            proxyReq.write(body);
          }
          proxyReq.end();
        });
      });
    },
  };
}

// 自定义代理中间件：通过环境代理访问 Supabase
function supabaseProxyPlugin() {
  return {
    name: 'supabase-proxy',
    configureServer(server: any) {
      server.middlewares.use('/supabase', async (req: any, res: any) => {
        const httpProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
        const target = 'https://yreblqevblspdtinhdec.supabase.co';

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const fullUrl = target + (req.url || '');
          const parsed = new URL(fullUrl);

          const headers: Record<string, string> = {};
          for (const [key, val] of Object.entries(req.headers)) {
            if (key !== 'host' && key !== 'connection' && typeof val === 'string') {
              headers[key] = val;
            }
          }

          const options: https.RequestOptions = {
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname + parsed.search,
            method: req.method || 'GET',
            headers,
          };

          if (httpProxy) {
            options.agent = new HttpsProxyAgent(httpProxy) as any;
          }

          const proxyReq = https.request(options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode || 502;
            for (const [key, val] of Object.entries(proxyRes.headers)) {
              if (key !== 'transfer-encoding' && key !== 'content-encoding' && val) {
                res.setHeader(key, val);
              }
            }
            const respChunks: Buffer[] = [];
            proxyRes.on('data', (chunk) => respChunks.push(chunk));
            proxyRes.on('end', () => {
              res.end(Buffer.concat(respChunks));
            });
          });

          proxyReq.on('error', (err) => {
            console.error('Supabase proxy error:', err.message);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
          });

          if (body.length > 0) {
            proxyReq.write(body);
          }
          proxyReq.end();
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/.pnpm-store/**'],
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths(),
    supabaseProxyPlugin(),
    wereadProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: '个人工作台',
        short_name: '工作台',
        description: '一款集科研管理、阅读追踪、媒体库、职业规划、雅思学习和健康管理于一体的个人效率工具',
        theme_color: '#4A90B8',
        background_color: '#F0F7FF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        dir: 'ltr',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          }
        ],
        shortcuts: [
          {
            name: '今日待办',
            short_name: '待办',
            description: '查看今日待办事项',
            url: '/',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: '读书空间',
            short_name: '读书',
            description: '查看书架和阅读笔记',
            url: '/reading',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: '科研工作台',
            short_name: '科研',
            description: '管理科研论文和笔记',
            url: '/research',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    })
  ],
})
