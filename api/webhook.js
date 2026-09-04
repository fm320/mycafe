import { INITIAL_MENU_ITEMS, INITIAL_CAFE_CONFIG, INITIAL_ORDERS } from '../src/services/mockData.js';
import { processWhatsappMessage } from '../src/services/whatsappBotService.js';

export default async function handler(req, res) {
  // Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && (token === 'AromaBrew2026' || token === INITIAL_CAFE_CONFIG.wifiPass)) {
      console.log('✅ Meta Webhook Verified Successfully on Vercel!');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden');
    }
  }

  // Incoming Meta WhatsApp Messages (POST)
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const entry = payload?.entry?.[0];
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

      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Error handling webhook POST:', err);
      return res.status(500).send('Server Error');
    }
  }

  return res.status(405).send('Method Not Allowed');
}
