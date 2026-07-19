require('dotenv').config();  // <-- add this line
const mongoose = require('mongoose');
const User = require('./models/User');
const BotPersona = require('./models/BotPersona');
const Listing = require('./models/Listing');
const MarketStat = require('./models/MarketStat');
const NewsItem = require('./models/NewsItem');
const Event = require('./models/Event');
const connectDB = require('./config/db');

// ... rest of your seed code (botDefs, sample data, seed function)

const botDefs = [
  { name: 'LouRealtyBot', username: 'lourealtybot', avatar: 'https://robohash.org/lourealtybot?set=set4&size=100x100', niche: 'General' },
  { name: 'KYMarketBot', username: 'kymarketbot', avatar: 'https://robohash.org/kymarketbot?set=set4&size=100x100', niche: 'Market Data' },
  { name: 'NuLuDevBot', username: 'nuludevbot', avatar: 'https://robohash.org/nuludevbot?set=set4&size=100x100', niche: 'Construction' },
  { name: 'HighlandsAgent', username: 'highlandsagent', avatar: 'https://robohash.org/highlandsagent?set=set4&size=100x100', niche: 'Neighborhood' },
  { name: 'KYInvestorBot', username: 'kyinvestorbot', avatar: 'https://robohash.org/kyinvestorbot?set=set4&size=100x100', niche: 'Investment' },
  { name: 'LouClosingBot', username: 'louclosingbot', avatar: 'https://robohash.org/louclosingbot?set=set4&size=100x100', niche: 'General' },
  { name: 'KYNewsBot', username: 'kynewsbot', avatar: 'https://robohash.org/kynewsbot?set=set4&size=100x100', niche: 'General' },
  { name: 'StMatthewsRE', username: 'stmatthewsre', avatar: 'https://robohash.org/stmatthewsre?set=set4&size=100x100', niche: 'General' },
  { name: 'LouRentalBot', username: 'lourentalbot', avatar: 'https://robohash.org/lourentalbot?set=set4&size=100x100', niche: 'General' },
  { name: 'KYHistoricBot', username: 'kyhistoricbot', avatar: 'https://robohash.org/kyhistoricbot?set=set4&size=100x100', niche: 'General' }
];

const sampleListings = [
  {
    address: '1234 Bardstown Rd',
    city: 'Louisville',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Charming colonial in the heart of the Highlands. Hardwood floors, updated kitchen, and a large backyard.',
    images: ['https://picsum.photos/seed/listing1/600/400'],
    source: 'Manual'
  },
  {
    address: '5678 NuLu St',
    city: 'Louisville',
    price: 325000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    propertyType: 'Residential',
    status: 'Under Contract',
    description: 'Modern condo in the trendy NuLu district. Walk to shops and restaurants.',
    images: ['https://picsum.photos/seed/listing2/600/400'],
    source: 'Manual'
  },
  // Add more realistic listings...
];

const sampleStats = [
  { metric: 'Median Home Price', value: '$285,000', region: 'Louisville, KY', category: 'Price' },
  { metric: 'Average Days on Market', value: '28 days', region: 'Louisville, KY', category: 'Inventory' },
  { metric: 'Mortgage Rate 30yr Fixed', value: '6.75%', region: 'National', category: 'Economic' }
];

const sampleNews = [
  { headline: 'New NuLu Development Approved', summary: 'City council approved a 12-story mixed-use building on East Market Street.', category: 'Development' },
  { headline: 'Louisville Home Prices Up 4.2% YoY', summary: 'Local market continues to show steady growth despite national trends.', category: 'Market' }
];

const sampleEvents = [
  { title: 'Highlands Community Meeting', description: 'Discuss neighborhood safety and infrastructure projects.', startDate: new Date(Date.now() + 7*24*60*60*1000), type: 'Community Meeting' }
];

async function seed() {
  await connectDB();

  // Clear existing bot users and personas (optional – be careful in production)
  console.log('Cleaning old bot data...');
  await User.deleteMany({ isBot: true });
  await BotPersona.deleteMany({});

  // Create bots
  console.log('Creating bots...');
  for (const def of botDefs) {
    const user = await User.create({
      name: def.name,
      username: def.username,
      email: def.username + '@scroll.city',
      password: 'botpassword', // will be hashed
      avatar: def.avatar,
      isBot: true,
      botNiche: def.niche
    });
    await BotPersona.create({
      name: def.name,
      username: def.username,
      avatar: def.avatar,
      niche: def.niche,
      postFrequency: 30 + Math.floor(Math.random() * 30) // 30-60 minutes
    });
  }

  // Seed listings, stats, news, events
  console.log('Seeding data...');
  await Listing.insertMany(sampleListings);
  await MarketStat.insertMany(sampleStats);
  await NewsItem.insertMany(sampleNews);
  await Event.insertMany(sampleEvents);

  console.log('✅ Seed completed');
  process.exit(0);
}

seed();