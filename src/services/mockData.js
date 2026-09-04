export const INITIAL_CAFE_CONFIG = {
  name: "Aroma Reserve Roastery & Cafe",
  tagline: "Artisanal Brews, Fresh Pastries & Seamless Automation",
  address: "742 Commercial Street, Indiranagar, Bengaluru",
  phone: "+91 98765 43210",
  whatsappNumber: "919876543210",
  currency: "₹",
  taxRate: 5.0, // 5% GST
  tableCount: 10,
  wifiPass: "AromaBrew2026",
  openingHours: "07:00 AM - 10:00 PM",
  whatsappBot: {
    enabled: true,
    autoReply: true,
    botName: "AromaBot ☕",
    greeting: "Welcome to Aroma Reserve! ☕ I'm your digital barista assistant. How can I help you today?\n\n1️⃣ Type *MENU* to view digital menu\n2️⃣ Type *ORDER [item] for table [N]* to order\n3️⃣ Type *STATUS* for active order updates\n4️⃣ Type *RESERVE* for table booking",
    metaApiKey: "EAAG...MOCK_META_TOKEN",
    phoneNumberId: "1209059535633267",
    webhookUrl: "https://unmade-filtrate-outthink.ngrok-free.dev/api/whatsapp/webhook"
  }
};

export const INITIAL_CATEGORIES = [
  { id: "espresso", name: "Espresso & Coffee", icon: "Coffee" },
  { id: "cold_brews", name: "Cold Brews & Iced", icon: "IceCream" },
  { id: "tea", name: "Artisanal Teas", icon: "CupSoda" },
  { id: "bakery", name: "Fresh Bakery & Pastries", icon: "Cookie" },
  { id: "breakfast", name: "Gourmet Breakfast", icon: "Utensils" },
  { id: "desserts", name: "Handcrafted Desserts", icon: "Cake" }
];

export const INITIAL_MENU_ITEMS = [
  {
    id: "m1",
    name: "Smokey Velvet Latte",
    category: "espresso",
    price: 180,
    description: "Signature double-espresso infusion with smoked vanilla bean, velvety steamed milk, and cinnamon dust.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      milk: ["Whole Milk", "Oat Milk (+₹30)", "Almond Milk (+₹30)", "Skim Milk"],
      sugar: ["No Sugar", "Less Sugar (50%)", "Standard (100%)", "Extra Sweet"],
      temperature: ["Hot", "Iced"]
    }
  },
  {
    id: "m2",
    name: "Classic Cappuccino",
    category: "espresso",
    price: 150,
    description: "Rich dark roast espresso crowned with thick micro-foam and premium Belgian cocoa powder.",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: false,
    options: {
      milk: ["Whole Milk", "Oat Milk (+₹30)", "Almond Milk (+₹30)"],
      sugar: ["No Sugar", "Standard (100%)"]
    }
  },
  {
    id: "m3",
    name: "Nitro Hazelnut Cold Brew",
    category: "cold_brews",
    price: 220,
    description: "Slow-steeped 20-hour cold brew infused with nitrogen and organic hazelnut drizzle.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      sugar: ["No Sugar", "Less Sugar", "Extra Sweet"],
      ice: ["Regular Ice", "Less Ice", "No Ice"]
    }
  },
  {
    id: "m4",
    name: "Matcha Oat Blossom",
    category: "tea",
    price: 210,
    description: "Ceremonial grade Uji Matcha whisked with creamy oat milk and organic lavender honey.",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      sugar: ["Unsweetened", "Honey Sweetened"],
      temperature: ["Hot", "Iced"]
    }
  },
  {
    id: "m5",
    name: "Flaky Almond Croissant",
    category: "bakery",
    price: 140,
    description: "Freshly baked French butter croissant filled with almond frangipane and topped with toasted almonds.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      warming: ["Warm", "Room Temperature"]
    }
  },
  {
    id: "m6",
    name: "Truffle & Avocado Toast",
    category: "breakfast",
    price: 280,
    description: "Artisanal sourdough topped with smashed Hass avocado, poached egg, microgreens, and white truffle oil.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      egg: ["Poached Egg", "Scrambled Eggs", "No Egg (Vegan)"]
    }
  },
  {
    id: "m7",
    name: "Belgian Dark Chocolate Tart",
    category: "desserts",
    price: 190,
    description: "70% single-origin dark chocolate ganache in a crisp sable pastry shell with sea salt flakes.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: false,
    options: {}
  },
  {
    id: "m8",
    name: "Double Caramel Macchiato",
    category: "espresso",
    price: 195,
    description: "Freshly steamed milk with vanilla syrup, marked with espresso and topped with rich caramel drizzle.",
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80",
    veg: true,
    popular: true,
    options: {
      milk: ["Whole Milk", "Oat Milk (+₹30)"],
      temperature: ["Hot", "Iced"]
    }
  }
];

export const INITIAL_TABLES = Array.from({ length: 10 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  capacity: i % 2 === 0 ? 4 : 2,
  status: i === 1 ? "occupied" : i === 3 ? "reserved" : "available",
  currentOrderId: i === 1 ? "ord-101" : null,
  seatedTime: i === 1 ? new Date(Date.now() - 25 * 60000).toISOString() : null
}));

export const INITIAL_ORDERS = [
  {
    id: "ord-101",
    customerName: "Rohan Sharma",
    customerPhone: "+91 98765 43210",
    orderType: "Dine-In",
    tableNumber: 2,
    status: "Preparing", // New, Preparing, Ready, Delivered, Cancelled
    paymentStatus: "Paid", // Unpaid, Paid
    paymentMethod: "UPI QR",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    source: "WhatsApp Bot",
    items: [
      { id: "m1", name: "Smokey Velvet Latte", price: 180, quantity: 2, customization: "Oat Milk, Hot" },
      { id: "m5", name: "Flaky Almond Croissant", price: 140, quantity: 1, customization: "Warm" }
    ],
    subtotal: 500,
    tax: 25,
    total: 525
  },
  {
    id: "ord-102",
    customerName: "Priya Patel",
    customerPhone: "+91 98123 45678",
    orderType: "Takeaway",
    tableNumber: null,
    status: "Ready",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    source: "POS Counter",
    items: [
      { id: "m3", name: "Nitro Hazelnut Cold Brew", price: 220, quantity: 1, customization: "Regular Ice" },
      { id: "m6", name: "Truffle & Avocado Toast", price: 280, quantity: 1, customization: "Poached Egg" }
    ],
    subtotal: 500,
    tax: 25,
    total: 525
  },
  {
    id: "ord-103",
    customerName: "Aarav Mehta",
    customerPhone: "+91 97654 32109",
    orderType: "Dine-In",
    tableNumber: 4,
    status: "New",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    source: "QR Self-Order",
    items: [
      { id: "m4", name: "Matcha Oat Blossom", price: 210, quantity: 1, customization: "Iced" },
      { id: "m7", name: "Belgian Dark Chocolate Tart", price: 190, quantity: 1, customization: "" }
    ],
    subtotal: 400,
    tax: 20,
    total: 420
  }
];

export const INITIAL_WHATSAPP_MESSAGES = [
  {
    id: "w1",
    sender: "bot",
    text: "Welcome to Aroma Reserve! ☕ I'm your digital barista assistant.\nHow can I help you today?\n\n1️⃣ Type *MENU* to view digital menu\n2️⃣ Type *ORDER [item] for table [N]* to order\n3️⃣ Type *STATUS* for active order updates\n4️⃣ Type *RESERVE* for table booking",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: "w2",
    sender: "user",
    text: "Hi! Can I order 2 Smokey Velvet Lattes for Table 2?",
    timestamp: new Date(Date.now() - 16 * 60000).toISOString()
  },
  {
    id: "w3",
    sender: "bot",
    text: "🎉 Order Confirmed! #ord-101\n\n📋 Items:\n• 2x Smokey Velvet Latte (₹360.00)\n• 1x Flaky Almond Croissant (₹140.00)\n\n💰 Total: ₹525.00 (Paid via UPI)\n📍 Table: 2\n\nYour order is currently *Preparing* in the kitchen! ⏱️ ETA: ~10 mins.",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  }
];
