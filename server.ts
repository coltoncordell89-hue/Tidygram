import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'bookings.json');

app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed data helper
function getInitialData() {
  return [
    {
      id: 'GIFT-WELCOME5',
      occasion: 'housewarming',
      recipientName: 'Sarah Jenkins',
      recipientEmail: 'sarah.j@example.com',
      senderName: 'David & Clara',
      senderEmail: 'clara.d@example.com',
      personalMessage: 'Congratulations on your beautiful new townhouse! We hope this gift of professional deep cleaning gives you some extra hours to settle in and enjoy your lovely new sanctuary without lifting a finger.',
      packageId: 'golden_touch',
      addOns: ['oven', 'windows'],
      status: 'unredeemed',
      deliveryDate: '2026-07-15',
      deliveryMethod: 'email',
      scheduledDate: null,
      scheduledTime: null,
      specialInstructions: null,
      createdAt: '2026-07-10T14:30:00.000Z'
    },
    {
      id: 'GIFT-CUDDLE9',
      occasion: 'new_baby',
      recipientName: 'Marcus & Elena',
      recipientEmail: 'elena.m@example.com',
      senderName: 'Aunt Eleanor',
      senderEmail: 'eleanor.g@example.com',
      personalMessage: 'Welcome to the world, precious baby Leo! Elena and Marcus, please take this time to cuddle and rest. Let the professional cleaning team handle the house while you soak in these fleeting newborn moments.',
      packageId: 'sanctuary_wellness',
      addOns: ['pets'],
      status: 'scheduled',
      deliveryDate: '2026-07-12',
      deliveryMethod: 'email',
      scheduledDate: '2026-07-22',
      scheduledTime: '10:00 AM',
      addressLine1: '452 Linden Boulevard',
      addressLine2: 'Apt 3B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      specialInstructions: 'We have a friendly golden retriever who will be crated in the bedroom. Please focus heavily on pet hair vacuuming in the nursery!',
      createdAt: '2026-07-09T09:15:00.000Z'
    },
    {
      id: 'GIFT-THANKS2',
      occasion: 'thank_you',
      recipientName: 'Professor Arthur',
      recipientEmail: 'arthur.prof@example.com',
      senderName: 'The Class of 2026',
      senderEmail: 'rep@example.com',
      personalMessage: 'Thank you for your tireless mentorship, guidance, and patience this semester. You have polished our minds, so we wanted to return the favor by polishing your living room! Enjoy this standard service on us.',
      packageId: 'linen_refresh',
      addOns: [],
      status: 'completed',
      deliveryDate: '2026-07-05',
      deliveryMethod: 'print',
      scheduledDate: '2026-07-10',
      scheduledTime: '02:00 PM',
      addressLine1: '12 University Terrace',
      city: 'Eugene',
      state: 'OR',
      zipCode: '97403',
      specialInstructions: 'Knock gently, cat is indoor-only and likes to sneak out.',
      createdAt: '2026-07-01T11:00:00.000Z'
    }
  ];
}

// Load database
function loadBookings() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bookings database, using seed:', error);
  }
  const initial = getInitialData();
  saveBookings(initial);
  return initial;
}

// Save database
function saveBookings(bookings: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving bookings database:', error);
  }
}

// --- API Endpoints ---

// 1. Generate customized greeting card message using Gemini API
app.post('/api/giftcards/generate-message', async (req, res) => {
  const { occasion, senderName, recipientName, promptHint } = req.body;
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    // Graceful fallback if API key is not configured yet
    return res.json({
      message: `Dear ${recipientName},\n\nI wanted to gift you some extra peace of mind and clean comfort. Please enjoy this professional cleaning service on me—you deserve to relax and let someone else do the dusting for once!\n\nWith warm wishes,\n${senderName}`
    });
  }

  try {
    const prompt = `Draft a warm, beautiful, and personalized card greeting for a high-end cleaning service gift.
Details:
- Occasion: ${occasion || 'just because'}
- Sender (From): ${senderName}
- Recipient (To): ${recipientName}
- Additional personalization context/hint: "${promptHint || 'no extra details'}"

Instructions:
Write a thoughtful message of exactly 3-4 sentences. Do not use generic phrases. Connect the cleaning gift to the occasion (e.g. housewarming means settling in; new baby means resting; "just because" means giving them back their valuable free time). The style should feel heartfelt and premium. Do not output any formatting headers, markdown labels, "Subject:" fields, or generic placeholders like "[Your Name]". Output ONLY the card message content directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    const generatedText = response.text?.trim() || '';
    res.json({ message: generatedText });
  } catch (error: any) {
    console.error('Gemini API message generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate message using AI', 
      details: error.message,
      fallback: `Dear ${recipientName},\n\nI wanted to gift you some extra peace of mind and clean comfort. Please enjoy this professional cleaning service on me—you deserve to relax and let someone else do the dusting for once!\n\nWith warm wishes,\n${senderName}`
    });
  }
});

// 2. Fetch all gift cards (Admin Tracker View)
app.get('/api/giftcards', (req, res) => {
  const bookings = loadBookings();
  res.json(bookings);
});

// 3. Fetch single gift card by code (Redemption View)
app.get('/api/giftcards/:code', (req, res) => {
  const { code } = req.params;
  const bookings = loadBookings();
  const card = bookings.find((c: any) => c.id.toUpperCase() === code.toUpperCase());
  
  if (!card) {
    return res.status(404).json({ error: 'Gift Card not found' });
  }
  res.json(card);
});

// 4. Create new gift card (Buyer Flow Purchase)
app.post('/api/giftcards', (req, res) => {
  const {
    occasion,
    recipientName,
    recipientEmail,
    senderName,
    senderEmail,
    personalMessage,
    packageId,
    addOns,
    deliveryDate,
    deliveryMethod,
    customValue
  } = req.body;

  if (!recipientName || !senderName || !packageId) {
    return res.status(400).json({ error: 'Recipient name, sender name, and package selection are required.' });
  }

  const bookings = loadBookings();
  
  // Generate a random unique gift code
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const giftCode = `GIFT-${occasion.toUpperCase().substring(0, 4)}-${randomSuffix}`;

  const newCard = {
    id: giftCode,
    occasion,
    recipientName,
    recipientEmail: recipientEmail || '',
    senderName,
    senderEmail: senderEmail || '',
    personalMessage,
    packageId,
    customValue,
    addOns: addOns || [],
    status: 'unredeemed',
    deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
    deliveryMethod: deliveryMethod || 'email',
    scheduledDate: null,
    scheduledTime: null,
    specialInstructions: null,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newCard);
  saveBookings(bookings);
  res.status(21).json(newCard);
});

// 5. Redeem gift card / Schedule cleaning (Recipient Flow Redemption)
app.post('/api/giftcards/:code/redeem', (req, res) => {
  const { code } = req.params;
  const {
    scheduledDate,
    scheduledTime,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    specialInstructions
  } = req.body;

  if (!scheduledDate || !scheduledTime || !addressLine1 || !city || !state || !zipCode) {
    return res.status(400).json({ error: 'Complete scheduling and address details are required.' });
  }

  const bookings = loadBookings();
  const cardIndex = bookings.findIndex((c: any) => c.id.toUpperCase() === code.toUpperCase());

  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Gift Card not found' });
  }

  const card = bookings[cardIndex];
  
  // Update details
  card.scheduledDate = scheduledDate;
  card.scheduledTime = scheduledTime;
  card.addressLine1 = addressLine1;
  card.addressLine2 = addressLine2 || '';
  card.city = city;
  card.state = state;
  card.zipCode = zipCode;
  card.specialInstructions = specialInstructions || '';
  card.status = 'scheduled';

  bookings[cardIndex] = card;
  saveBookings(bookings);
  res.json(card);
});

// 6. Delete or complete booking (for convenience in simulation)
app.post('/api/giftcards/:code/complete', (req, res) => {
  const { code } = req.params;
  const bookings = loadBookings();
  const cardIndex = bookings.findIndex((c: any) => c.id.toUpperCase() === code.toUpperCase());

  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Gift Card not found' });
  }

  bookings[cardIndex].status = 'completed';
  saveBookings(bookings);
  res.json(bookings[cardIndex]);
});

// --- Vite & Client static serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
