import { INITIAL_MENU_ITEMS, INITIAL_CAFE_CONFIG, INITIAL_ORDERS } from '../src/services/mockData.js';
import { processWhatsappMessage } from '../src/services/whatsappBotService.js';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode') || (req.query && req.query['hub.mode']);
    const token = url.searchParams.get('hub.verify_token') || (req.query && req.query['hub.verify_token']);
    const challenge = url.searchParams.get('hub.challenge') || (req.query && req.query['hub.challenge']);

    if (mode === 'subscribe' && (token === 'AromaBrew2026' || token === '12345' || token === INITIAL_CAFE_CONFIG.wifiPass)) {
      console.log('✅ Meta Webhook Verified Successfully on Vercel!');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end(challenge);
    } else {
      res.statusCode = 403;
      return res.end('Forbidden');
    }
  }

  // Incoming Meta WhatsApp Messages (POST)
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromPhone = message.from;
        const userText = message.text.body;

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
      return res.end(JSON.stringify({ status: 'ok' }));
    } catch (err) {
      console.error('Error handling webhook POST:', err);
      res.statusCode = 500;
      return res.end('Server Error');
    }
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
