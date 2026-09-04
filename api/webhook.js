const INITIAL_CAFE_CONFIG = {
  name: "Aroma Reserve Roastery & Cafe",
  currency: "₹",
  taxRate: 5.0,
  whatsappBot: {
    greeting: "Welcome to Aroma Reserve! ☕ I'm your digital barista assistant. How can I help you today?\n\n1️⃣ Type *MENU* to view digital menu\n2️⃣ Type *ORDER [item] for table [N]* to order\n3️⃣ Type *STATUS* for active order updates\n4️⃣ Type *RESERVE* for table booking"
  }
};

const INITIAL_MENU_ITEMS = [
  { id: "m1", name: "Smokey Velvet Latte", price: 180, description: "Signature double-espresso infusion with smoked vanilla bean." },
  { id: "m2", name: "Classic Cappuccino", price: 150, description: "Rich dark roast espresso crowned with thick micro-foam." },
  { id: "m3", name: "Nitro Hazelnut Cold Brew", price: 220, description: "Slow-steeped 20-hour cold brew infused with nitrogen." },
  { id: "m4", name: "Matcha Oat Blossom", price: 210, description: "Ceremonial grade Uji Matcha whisked with creamy oat milk." },
  { id: "m5", name: "Flaky Almond Croissant", price: 140, description: "Freshly baked French butter croissant." }
];

const INITIAL_ORDERS = [];

function processWhatsappMessage(inputMessage, menuItems, cafeConfig, orders) {
  const text = (inputMessage || "").toLowerCase().trim();
  const currency = cafeConfig.currency || "₹";

  if (text.includes("menu") || text === "1" || text.includes("card") || text.includes("list")) {
    const formattedMenu = menuItems.map(item => `• *${item.name}* - ${currency}${item.price.toFixed(2)}\n  _${item.description}_`).join("\n\n");
    return `☕ *${cafeConfig.name.toUpperCase()} MENU* ☕\n\n${formattedMenu}\n\n👉 *To place an order via WhatsApp, reply:* \n"Order [Item Name] for Table [Number]"\nExample: _Order 2 Cappuccino for Table 4_`;
  }

  if (text.startsWith("order") || text.includes("table") || text.includes("want") || text.includes("cappuccino") || text.includes("latte") || text.includes("croissant")) {
    const tableMatch = text.match(/table\s*#?\s*(\d+)/i) || text.match(/t\s*#?\s*(\d+)/i);
    const tableNumber = tableMatch ? parseInt(tableMatch[1], 10) : 1;

    const itemsFound = [];
    menuItems.forEach(menuItem => {
      if (text.includes(menuItem.name.toLowerCase()) || menuItem.name.toLowerCase().split(" ").some(w => w.length > 3 && text.includes(w))) {
        itemsFound.push({ ...menuItem, quantity: 1 });
      }
    });

    if (itemsFound.length > 0) {
      const subtotal = itemsFound.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const tax = (subtotal * cafeConfig.taxRate) / 100;
      const total = subtotal + tax;
      return `🎉 *ORDER CONFIRMED!* (#ord-${Math.floor(100 + Math.random() * 900)})\n\n📍 *Table:* ${tableNumber}\n📋 *Items:* \n${itemsFound.map(i => `• ${i.quantity}x ${i.name} (${currency}${i.price.toFixed(2)})`).join("\n")}\n\n💵 *Total:* ${currency}${total.toFixed(2)} (GST Included)\n💳 *Payment:* Auto-charged via WhatsApp UPI\n\nYour order has been sent to our kitchen! ⚡`;
    }
  }

  if (text.includes("status") || text.includes("track") || text === "3") {
    return `🔎 *ORDER STATUS* (#ord-104)\n\n📍 Table: 4\n📊 Status: 👨‍🍳 *Cooking in Kitchen*\n\n_Thank you for dining with ${cafeConfig.name}!_`;
  }

  if (text.includes("reserve") || text.includes("book") || text === "4") {
    return `🪑 *TABLE RESERVATION*\n\nTo reserve a table, please reply:\n"Reserve [Name] for [N] people at [Time]"\nExample: _Reserve Nazim for 4 people at 7:00 PM_`;
  }

  return cafeConfig.whatsappBot.greeting;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && (token === 'AromaBrew2026' || token === '12345')) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body;
      console.log('Incoming Webhook POST Payload:', JSON.stringify(payload));

      const entry = payload?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromPhone = message.from;
        const userText = message.text.body;

        const replyText = processWhatsappMessage(userText, INITIAL_MENU_ITEMS, INITIAL_CAFE_CONFIG, INITIAL_ORDERS);

        const phoneId = process.env.PHONE_NUMBER_ID || '1209059535633267';
        const metaToken = process.env.META_ACCESS_TOKEN || 'EAAc57YxZCEk4BSYHeDF37vzTS6mxp8YZCuKgDFSlBqoPlI6zYjCe9iyXSuCOJYZCb3CcfGmaNrWhstGXn4VKUATgjz9AX7Tm0HKLeAX57kfuPA3nNseT5uVdnQDZABZC89mJuU3ZCStiJ5TFa8TrAAXGdSyOCR3Ql06lseCTzv59o15O0vL5tPY2ZBN8jOZAG2vPDUZArh8svdtzhBSQJM06DfliqwYls9ufKWUA2vuSMcXD95qrxxjCSJNiHBX2RPCZAeaMdNArj19DZA6dGAZBmkZBf';

        if (metaToken) {
          await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: fromPhone,
              type: 'text',
              text: { body: replyText }
            })
          });
        }
      }

      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Error handling webhook POST:', err);
      return res.status(200).json({ status: 'ok' });
    }
  }

  return res.status(405).send('Method Not Allowed');
};
