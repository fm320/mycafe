import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { INITIAL_MENU_ITEMS, INITIAL_CAFE_CONFIG, INITIAL_ORDERS } from './src/services/mockData.js'
import { processWhatsappMessage } from './src/services/whatsappBotService.js'

const whatsappWebhookPlugin = () => ({
  name: 'whatsapp-webhook-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      if (url.pathname === '/webhook' || url.pathname === '/api/webhook') {
        if (req.method === 'GET') {
          const mode = url.searchParams.get('hub.mode');
          const token = url.searchParams.get('hub.verify_token');
          const challenge = url.searchParams.get('hub.challenge');

          if (mode === 'subscribe' && (token === 'AromaBrew2026' || token === INITIAL_CAFE_CONFIG.wifiPass)) {
            console.log('✅ Meta Webhook Verified Successfully via Vite Dev Server!');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(challenge);
            return;
          } else {
            console.log('❌ Webhook Token mismatch:', token);
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              console.log('📩 Incoming Webhook Event:', JSON.stringify(payload));

              const entry = payload.entry?.[0];
              const changes = entry?.changes?.[0];
              const value = changes?.value;
              const message = value?.messages?.[0];

              if (message && message.type === 'text') {
                const fromPhone = message.from;
                const userText = message.text.body;

                console.log(`💬 WhatsApp Msg from ${fromPhone}: "${userText}"`);

                const botResult = processWhatsappMessage(userText, INITIAL_MENU_ITEMS, INITIAL_CAFE_CONFIG, INITIAL_ORDERS);

                if (botResult && botResult.text) {
                  const metaToken = INITIAL_CAFE_CONFIG.whatsappBot?.metaApiKey;
                  const phoneId = INITIAL_CAFE_CONFIG.whatsappBot?.phoneNumberId || '1209059535633267';

                  if (metaToken && !metaToken.includes("MOCK")) {
                    await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
                      method: "POST",
                      headers: {
                        "Authorization": `Bearer ${metaToken}`,
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: fromPhone,
                        type: "text",
                        text: { body: botResult.text }
                      })
                    });
                  }
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok' }));
            } catch (err) {
              console.error('Error handling webhook POST:', err);
              res.statusCode = 500;
              res.end('Server Error');
            }
          });
          return;
        }
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), whatsappWebhookPlugin()],
});
