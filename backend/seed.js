require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BotPersona = require('./models/BotPersona');
const Listing = require('./models/Listing');
const MarketStat = require('./models/MarketStat');
const NewsItem = require('./models/NewsItem');
const Event = require('./models/Event');
const connectDB = require('./config/db');

// ─── Bot definitions ──────────────────────────────────────────
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

// ─── REAL LISTINGS FROM REPORT ──────────────────────────────

const activeListings = [
  { address: '12923 Richland Ave', city: 'Louisville', state: 'KY', zip: '40220', price: 355000, bedrooms: 4, bathrooms: 3, sqft: 1321, propertyType: 'Single Family', status: 'Active', description: 'Charming single‑family home with 4 bedrooms and 3 baths. Built in 1957 on a 9,148 sqft lot. MLS ID: 1720800.', images: ['https://picsum.photos/seed/richland/600/400'], source: 'Manual' },
  { address: '67517 Manslick Rd', city: 'Louisville', state: 'KY', zip: '40214', price: 250000, bedrooms: 3, bathrooms: 2, sqft: 1050, propertyType: 'Single Family', status: 'Active', description: 'Cozy 3/2 home on a 9,849 sqft lot. Built in 1973. MLS ID: 1723787.', images: ['https://picsum.photos/seed/manslick/600/400'], source: 'Manual' },
  { address: '74313 Naneen Dr', city: 'Louisville', state: 'KY', zip: '40216', price: 237500, bedrooms: 3, bathrooms: 2, sqft: 1406, propertyType: 'Single Family', status: 'Active', description: 'Spacious 3/2 home on a 7,318 sqft lot. Built in 1962. MLS ID: 1723780.', images: ['https://picsum.photos/seed/naneen/600/400'], source: 'Manual' },
  { address: '87530 Beechspring Farm Blvd', city: 'Louisville', state: 'KY', zip: '40241', price: 1275000, bedrooms: 5, bathrooms: 4, sqft: 3200, propertyType: 'Single Family', status: 'Active', description: 'Luxury estate on 0.49 acres. Built in 2007. MLS ID: 1723756.', images: ['https://picsum.photos/seed/beechspring/600/400'], source: 'Manual', featured: true },
  { address: '93205 W Broadway', city: 'Louisville', state: 'KY', zip: '40211', price: 145000, bedrooms: 4, bathrooms: 1, sqft: 1289, propertyType: 'Single Family', status: 'Active', description: 'Fixer‑upper with 4 beds and 1 bath on a 3,947 sqft lot. Built in 1923. MLS ID: 1723772.', images: ['https://picsum.photos/seed/wbroadway/600/400'], source: 'Manual' },
  { address: '10307 Brookfield View Dr', city: 'Louisville', state: 'KY', zip: '40245', price: 480000, bedrooms: 5, bathrooms: 4, sqft: 2140, propertyType: 'Single Family', status: 'Active', description: 'Beautiful 5/4 home on a 6,416 sqft lot. Built in 2014. MLS ID: 1723777.', images: ['https://picsum.photos/seed/brookfield/600/400'], source: 'Manual' },
  { address: '12219 W Oak St', city: 'Louisville', state: 'KY', zip: '40210', price: 110000, bedrooms: 5, bathrooms: 1, sqft: 1524, propertyType: 'Single Family', status: 'Active', description: 'Distressed property – Notice of Lis Pendens. MLS ID: 1723779.', images: ['https://picsum.photos/seed/woak/600/400'], source: 'Manual' },
  { address: '3504 Lodge Ln, Apt 129', city: 'Louisville', state: 'KY', zip: '40218', price: 69999, bedrooms: 1, bathrooms: 1, sqft: 689, propertyType: 'Condo/Townhouse', status: 'Active', description: 'Notice of Foreclosure Sale. MLS ID: 1723709.', images: ['https://picsum.photos/seed/lodge/600/400'], source: 'Manual' },
  { address: '34913 Seville Dr', city: 'Louisville', state: 'KY', zip: '40272', price: 135000, bedrooms: 3, bathrooms: 1, sqft: 950, propertyType: 'Single Family', status: 'Active', description: 'Newly Filed Complaint. MLS ID: 1723604.', images: ['https://picsum.photos/seed/seville/600/400'], source: 'Manual' },
  { address: '6718 Talon PI', city: 'Louisville', state: 'KY', zip: '40223', price: 830000, bedrooms: 5, bathrooms: 4, sqft: 3396, propertyType: 'Single Family', status: 'Active', description: 'Newly Filed Complaint. MLS ID: 1723268.', images: ['https://picsum.photos/seed/talon/600/400'], source: 'Manual', featured: true },
  { address: '73514 Sample Way', city: 'Louisville', state: 'KY', zip: '40245', price: 450000, bedrooms: 4, bathrooms: 4, sqft: 2500, propertyType: 'Single Family', status: 'Active', description: 'Newly Filed Complaint. MLS ID: 1723170.', images: ['https://picsum.photos/seed/sampleway/600/400'], source: 'Manual' },
  { address: '2839 Bexley Ct', city: 'Louisville', state: 'KY', zip: '40206', price: 1, bedrooms: 2, bathrooms: 2, sqft: 1894, propertyType: 'Condo/Townhouse', status: 'Active', description: 'Notice of Lis Pendens – $1 listing price. MLS ID: 26016227.', images: ['https://picsum.photos/seed/bexley/600/400'], source: 'Manual' }
];

const pendingListings = [
  { address: '12518 Foxy Poise Rd', city: 'Louisville', state: 'KY', zip: '40220', price: 450000, bedrooms: 4, bathrooms: 4, sqft: 2324, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/19/2026. MLS ID: 1723740.', images: ['https://picsum.photos/seed/foxy/600/400'], source: 'Manual' },
  { address: '26623 Holly Lake Dr', city: 'Louisville', state: 'KY', zip: '40291', price: 249900, bedrooms: 3, bathrooms: 2, sqft: 1245, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/19/2026. MLS ID: 1723567.', images: ['https://picsum.photos/seed/hollylake/600/400'], source: 'Manual' },
  { address: '13401 Kinross Blvd', city: 'Louisville', state: 'KY', zip: '40272', price: 220000, bedrooms: 3, bathrooms: 1, sqft: 1911, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/19/2026. MLS ID: 1721194.', images: ['https://picsum.photos/seed/kinross/600/400'], source: 'Manual' },
  { address: '113 La Fontenay Ct', city: 'Louisville', state: 'KY', zip: '40223', price: 155000, bedrooms: 3, bathrooms: 2, sqft: 1345, propertyType: 'Condo/Townhouse', status: 'Pending', description: 'Pending as of 7/19/2026. MLS ID: 1722482.', images: ['https://picsum.photos/seed/lafontenay/600/400'], source: 'Manual' },
  { address: '53203 Morningview Dr', city: 'Louisville', state: 'KY', zip: '40242', price: 475000, bedrooms: 4, bathrooms: 3, sqft: 2265, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/19/2026. MLS ID: 1714213.', images: ['https://picsum.photos/seed/morningview/600/400'], source: 'Manual' },
  { address: '68306 Aspen Ave', city: 'Louisville', state: 'KY', zip: '40258', price: 239900, bedrooms: 3, bathrooms: 1, sqft: 1500, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/18/2026. MLS ID: 1720986.', images: ['https://picsum.photos/seed/aspen/600/400'], source: 'Manual' },
  { address: '76705 Bedford Ln', city: 'Louisville', state: 'KY', zip: '40222', price: 400000, bedrooms: 4, bathrooms: 2, sqft: 1400, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/18/2026. MLS ID: 1723587.', images: ['https://picsum.photos/seed/bedford/600/400'], source: 'Manual' },
  { address: '1007 Corn Island Ct', city: 'Louisville', state: 'KY', zip: '40207', price: 699000, bedrooms: 4, bathrooms: 4, sqft: 3307, propertyType: 'Single Family', status: 'Pending', description: 'Pending as of 7/18/2026. MLS ID: 1722735.', images: ['https://picsum.photos/seed/cornisland/600/400'], source: 'Manual', featured: true },
  { address: '1502 Eastbridge Ct', city: 'Louisville', state: 'KY', zip: '40223', price: 326000, bedrooms: 3, bathrooms: 3, sqft: 1818, propertyType: 'Condo/Townhouse', status: 'Pending', description: 'Pending as of 7/18/2026. MLS ID: 1723269.', images: ['https://picsum.photos/seed/eastbridge/600/400'], source: 'Manual' },
  { address: '10249 El Conquistador PI', city: 'Louisville', state: 'KY', zip: '40220', price: 50000, bedrooms: 1, bathrooms: 1, sqft: 550, propertyType: 'Condo/Townhouse', status: 'Pending', description: 'Pending as of 7/18/2026. MLS ID: 1713789.', images: ['https://picsum.photos/seed/conquistador/600/400'], source: 'Manual' }
];

const closedListings = [
  { address: '125 S 1st St, Apt 10', city: 'Louisville', state: 'KY', zip: '40203', price: 111000, bedrooms: 1, bathrooms: 1, sqft: 705, propertyType: 'Condo/Townhouse', status: 'Closed', description: 'Closed 7/17/2026. MLS ID: 1715972.', images: ['https://picsum.photos/seed/s1st/600/400'], source: 'Manual' },
  { address: '2229 Albany Ave', city: 'Louisville', state: 'KY', zip: '40206', price: 400000, bedrooms: 3, bathrooms: 3, sqft: 1182, propertyType: 'Single Family', status: 'Closed', description: 'Closed 7/17/2026. MLS ID: 1719583.', images: ['https://picsum.photos/seed/albany/600/400'], source: 'Manual' },
  { address: '6704 Ashmead Dr', city: 'Louisville', state: 'KY', zip: '40291', price: 265000, bedrooms: 3, bathrooms: 2, sqft: 1107, propertyType: 'Single Family', status: 'Closed', description: 'Closed 7/17/2026. MLS ID: 1720506.', images: ['https://picsum.photos/seed/ashmead/600/400'], source: 'Manual' },
  { address: '12146 Belmont Park Cir', city: 'Louisville', state: 'KY', zip: '40243', price: 335000, bedrooms: 2, bathrooms: 3, sqft: 1614, propertyType: 'Single Family', status: 'Closed', description: 'Closed 7/17/2026. MLS ID: 1721635.', images: ['https://picsum.photos/seed/belmont/600/400'], source: 'Manual' },
  { address: '1125 Berry Blvd', city: 'Louisville', state: 'KY', zip: '40215', price: 169000, bedrooms: 3, bathrooms: 1, sqft: 1386, propertyType: 'Single Family', status: 'Closed', description: 'Closed 7/17/2026. MLS ID: 1720125.', images: ['https://picsum.photos/seed/berry/600/400'], source: 'Manual' }
];

// Combine all listings
const allListings = [...activeListings, ...pendingListings, ...closedListings];

// ─── Market Stats from Report ─────────────────────────────────
const marketStats = [
  { metric: 'Median Estimated Property Value', value: '$279,230', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2026-06-30') },
  { metric: 'Median Estimated Property Value (Last Month)', value: '$266,910', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2026-05-31') },
  { metric: 'Median Sold Price', value: '$284,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Median List Price', value: '$282,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Active Listings Count', value: '1,245', region: 'Louisville, KY', category: 'Inventory', source: 'RPR Data', date: new Date('2026-06-30') },
  { metric: 'Months of Inventory', value: '2.1 months', region: 'Louisville, KY', category: 'Inventory', source: 'RPR Data', date: new Date('2026-06-30') },
  { metric: 'Average Days on Market (Sold)', value: '28 days', region: 'Louisville, KY', category: 'Inventory', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'New Listings (June 2026)', value: '10', region: 'Louisville, KY', category: 'Inventory', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Pending Sales (June 2026)', value: '10', region: 'Louisville, KY', category: 'Sales', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Closed Sales (June 2026)', value: '10', region: 'Louisville, KY', category: 'Sales', source: 'MLS Data', date: new Date('2026-06-30') }
];

// ─── Generate News from Listings and Stats ───────────────────
function generateNews(listings, stats) {
  const news = [];

  // 1. Median price news
  const medianVal = stats.find(s => s.metric === 'Median Estimated Property Value');
  if (medianVal) {
    news.push({
      headline: `Louisville Median Home Value Reaches ${medianVal.value}`,
      summary: `The median estimated property value in Louisville has reached ${medianVal.value} as of June 2026, reflecting a steady upward trend in the local housing market.`,
      category: 'Market',
      source: 'RPR Market Report'
    });
  }

  // 2. Sold vs List price difference
  const soldPrice = stats.find(s => s.metric === 'Median Sold Price');
  const listPrice = stats.find(s => s.metric === 'Median List Price');
  if (soldPrice && listPrice) {
    const diff = parseInt(soldPrice.value.replace(/[$,]/g, '')) - parseInt(listPrice.value.replace(/[$,]/g, ''));
    const diffStr = diff > 0 ? `$${diff.toLocaleString()}` : `-$${Math.abs(diff).toLocaleString()}`;
    news.push({
      headline: `Louisville Homes Selling ${diff > 0 ? 'Above' : 'Below'} Asking Price`,
      summary: `The median sold price of ${soldPrice.value} is ${diffStr} compared to the median list price of ${listPrice.value}, indicating ${diff > 0 ? 'strong demand and competitive bidding' : 'a buyer\'s market with room for negotiation'}.`,
      category: 'Market',
      source: 'MLS Data'
    });
  }

  // 3. Active vs Pending/Closed
  const activeCount = listings.filter(l => l.status === 'Active').length;
  const pendingCount = listings.filter(l => l.status === 'Pending').length;
  const closedCount = listings.filter(l => l.status === 'Closed').length;
  news.push({
    headline: `${activeCount} Active Listings, ${pendingCount} Pending, ${closedCount} Closed in Louisville`,
    summary: `The local market currently shows ${activeCount} active listings, ${pendingCount} pending sales, and ${closedCount} closed transactions from recent activity.`,
    category: 'Market',
    source: 'RPR Market Activity'
  });

  // 4. Distressed properties
  const distressed = listings.filter(l => l.description && (l.description.includes('Foreclosure') || l.description.includes('Lis Pendens') || l.description.includes('Complaint') || l.description.includes('distressed'))).length;
  if (distressed > 0) {
    news.push({
      headline: `${distressed} Distressed Properties Identified in Louisville`,
      summary: `${distressed} properties with foreclosure notices, lis pendens, or complaints have been identified, presenting potential opportunities for investors.`,
      category: 'Market',
      source: 'RPR Distressed Data'
    });
  }

  // 5. Neighborhood spotlight – Highlands (addresses with 'Highlands' or specific streets)
  const highlandsListings = listings.filter(l => l.address && (l.address.includes('Highlands') || l.address.includes('Bardstown') || l.address.includes('Cherokee')));
  if (highlandsListings.length > 0) {
    news.push({
      headline: `Highlands Area Shows ${highlandsListings.length} Active Listings`,
      summary: `The Highlands neighborhood currently has ${highlandsListings.length} active listings, with prices ranging from $${Math.min(...highlandsListings.map(l => l.price)).toLocaleString()} to $${Math.max(...highlandsListings.map(l => l.price)).toLocaleString()}.`,
      category: 'Neighborhood',
      source: 'RPR Neighborhood Data'
    });
  }

  return news;
}

// ─── Seed Function ────────────────────────────────────────────
async function seed() {
  await connectDB();

  console.log('🧹 Cleaning old bot data...');
  await User.deleteMany({ isBot: true });
  await BotPersona.deleteMany({});

  console.log('🤖 Creating bots...');
  for (const def of botDefs) {
    const user = await User.create({
      name: def.name,
      username: def.username,
      email: def.username + '@scroll.city',
      password: 'botpassword',
      avatar: def.avatar,
      isBot: true,
      botNiche: def.niche
    });
    await BotPersona.create({
      name: def.name,
      username: def.username,
      avatar: def.avatar,
      niche: def.niche,
      postFrequency: 2 + Math.floor(Math.random() * 3), // 2-5 minutes
      active: true,
      lastPostAt: new Date()
    });
  }

  console.log(`📊 Seeding ${allListings.length} listings...`);
  await Listing.insertMany(allListings);

  console.log(`📈 Seeding ${marketStats.length} market stats...`);
  await MarketStat.insertMany(marketStats);

  // ─── Generate and seed news ─────────────────────────────────
  const generatedNews = generateNews(allListings, marketStats);
  console.log(`📰 Seeding ${generatedNews.length} news items...`);
  await NewsItem.insertMany(generatedNews);

  // ─── Events (we can keep some from previous seed or create from report) ──
  const events = [
    { title: 'Highlands Neighborhood Open House Tour', description: 'Join local agents for a self‑guided tour of 10 open houses in the Highlands. Free coffee and maps provided.', location: 'Bardstown Road, Louisville', startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), type: 'Open House' },
    { title: 'NuLu Business Association Meeting', description: 'Monthly meeting for NuLu business owners and residents to discuss development, safety, and upcoming events.', location: 'NuLu Marketplace', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), type: 'Community Meeting' },
    { title: 'First‑Time Homebuyer Webinar', description: 'Free webinar covering the homebuying process, financing options, and current market trends. Hosted by local real estate experts.', location: 'Online', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: 'Webinar' }
  ];
  console.log(`📅 Seeding ${events.length} events...`);
  await Event.insertMany(events);

  console.log('✅ Seed completed successfully! Bots will post every 2-5 minutes.');
  process.exit(0);
}

seed();