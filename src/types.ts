export type OccasionType = 'housewarming' | 'new_baby' | 'just_because' | 'birthday' | 'thank_you' | 'anniversary' | 'holiday';

export interface CleaningPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface GiftCard {
  id: string; // GIFT-XXXX
  occasion: OccasionType;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  personalMessage: string;
  packageId: string;
  customValue?: number;
  addOns: string[];
  status: 'unredeemed' | 'scheduled' | 'completed';
  deliveryDate: string; // YYYY-MM-DD
  deliveryMethod: 'email' | 'print';
  
  // Scheduling details once redeemed
  scheduledDate: string | null; // YYYY-MM-DD
  scheduledTime: string | null; // e.g., '09:00 AM'
  specialInstructions: string | null;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const CLEANING_PACKAGES: CleaningPackage[] = [
  {
    id: 'linen_refresh',
    name: 'Linen Refresh (Standard Clean)',
    price: 150,
    description: 'Perfect for routine maintenance. Focuses on dust reduction, sweeping, mopping, and vacuuming standard living spaces.',
    features: [
      'Dusting all accessible surfaces & furniture',
      'Vacuuming rugs, carpets, and mopping hard floors',
      'Basic bathroom cleaning (sinks, mirrors, toilets, showers)',
      'Kitchen exterior wipe-down (counters, stoves, sinks)',
      'Emptying trash and recycling bins'
    ]
  },
  {
    id: 'golden_touch',
    name: 'The Golden Touch (Deep Clean)',
    price: 250,
    description: 'Detailed, top-to-bottom clean. Ideal for homes that need intensive attention, including hard-to-reach spots and baseboards.',
    features: [
      'All features of the Linen Refresh standard package',
      'Hand-wiping baseboards, doors, and doorframes',
      'Deep scrubbing of tile grout in kitchen & bathrooms',
      'Detailed dusting of ceiling fans, vents, and light fixtures',
      'Wiping exterior of all cabinets and large appliances'
    ]
  },
  {
    id: 'new_beginnings',
    name: 'New Beginnings (Move-In/Out)',
    price: 400,
    description: 'Designed for completely empty homes. Perfect for securing rental deposits or welcoming families into a fresh start.',
    features: [
      'Comprehensive clean of every square inch of empty property',
      'Deep clean inside & outside of cabinets, drawers, and closets',
      'Inside-out cleaning of stove, oven, fridge, and microwave',
      'Scrubbing inside window sills, tracks, and glass panes',
      'Full wall spot cleaning & floor sanitization'
    ]
  },
  {
    id: 'sanctuary_wellness',
    name: 'Sanctuary Package (Wellness Clean)',
    price: 320,
    description: 'A holistic experience combining professional sanitization with aromatherapy, eco-friendly botanicals, and steam vacuuming.',
    features: [
      'Eco-friendly, certified non-toxic organic botanical detergents',
      'Aromatherapy diffusion with customizable organic essential oils (Linen, Eucalyptus, Lavender)',
      'HEPA-filter UV vacuuming to capture 99.97% of allergens',
      'Steam sanitization of mattresses, couches, and heavy drapes',
      'Bedroom linen refresh with organic lavender linen mist'
    ]
  }
];

export const ADD_ONS: AddOn[] = [
  { id: 'oven', name: 'Inside Oven Deep Scrub', price: 40, description: 'Intensive degreasing and cleaning of your oven interior.' },
  { id: 'fridge', name: 'Inside Refrigerator Wipe-Down', price: 35, description: 'Complete shelf clearing, cleaning, and deodorization.' },
  { id: 'windows', name: 'Interior Windows & Tracks', price: 55, description: 'Wiping down up to 10 windows, cleaning frames and tracks.' },
  { id: 'organization', name: 'Closet or Cabinet Organization', price: 60, description: 'Sorting, folding, and rearranging standard bedroom closet.' },
  { id: 'pets', name: 'Pet Hair Extra-Care Focus', price: 30, description: 'Specialized HEPA brushing of high-shedding furniture and corners.' }
];

export const OCCASION_THEMES: Record<OccasionType, { title: string; subtitle: string; bg: string; text: string; border: string; accent: string; font: string }> = {
  housewarming: {
    title: 'Welcome Home',
    subtitle: 'Warm wishes for your new sanctuary',
    bg: 'bg-gradient-to-br from-[#FAF6F0] to-[#EBE3D5]',
    text: 'text-[#5C5446]',
    border: 'border-[#CBB296]',
    accent: 'bg-[#B49A78]',
    font: 'font-serif'
  },
  new_baby: {
    title: 'New Sweet Beginnings',
    subtitle: 'Less chores, more snuggles with your little one',
    bg: 'bg-gradient-to-br from-[#FFF9FA] to-[#F1E0E3]',
    text: 'text-[#8C6D73]',
    border: 'border-[#E2C2C6]',
    accent: 'bg-[#CE9DA5]',
    font: 'font-sans'
  },
  just_because: {
    title: 'A Gift of Space & Time',
    subtitle: 'Just a little room to breathe',
    bg: 'bg-gradient-to-br from-[#F4F8F6] to-[#DBE7E1]',
    text: 'text-[#445A4E]',
    border: 'border-[#A3C3B2]',
    accent: 'bg-[#7A9E8B]',
    font: 'font-serif'
  },
  birthday: {
    title: 'Happy Birthday',
    subtitle: 'Relax and let us take care of the details today',
    bg: 'bg-gradient-to-br from-[#FFFBF4] to-[#F6E9D2]',
    text: 'text-[#7D643B]',
    border: 'border-[#E2C69B]',
    accent: 'bg-[#C9A66B]',
    font: 'font-serif'
  },
  thank_you: {
    title: 'With Sincerest Thanks',
    subtitle: 'Your kindness deserves a day of complete rest',
    bg: 'bg-gradient-to-br from-[#FAF8FC] to-[#E9E4F0]',
    text: 'text-[#645A73]',
    border: 'border-[#C6BCCF]',
    accent: 'bg-[#9F91B0]',
    font: 'font-serif'
  },
  anniversary: {
    title: 'Cherished Moments',
    subtitle: 'More time celebrating, less time cleaning',
    bg: 'bg-gradient-to-br from-[#FDFBF7] to-[#ECE5D9]',
    text: 'text-[#615C53]',
    border: 'border-[#D1C7B7]',
    accent: 'bg-[#AF9F8B]',
    font: 'font-serif'
  },
  holiday: {
    title: 'Season of Sanctuary',
    subtitle: 'Bringing peace and tidiness to your holidays',
    bg: 'bg-gradient-to-br from-[#FAF7F7] to-[#ECE1E1]',
    text: 'text-[#7A5454]',
    border: 'border-[#D9C1C1]',
    accent: 'bg-[#B58A8A]',
    font: 'font-serif'
  }
};
