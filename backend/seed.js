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

// Active Listings (from New / Active tables)
const activeListings = [
  {
    address: '12923 Richland Ave',
    city: 'Louisville',
    state: 'KY',
    zip: '40220',
    price: 355000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 1321,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Charming single‑family home with 4 bedrooms and 3 baths. Built in 1957 on a 9,148 sqft lot. MLS ID: 1720800.',
    images: ['https://picsum.photos/seed/richland/600/400'],
    source: 'Manual'
  },
  {
    address: '67517 Manslick Rd',
    city: 'Louisville',
    state: 'KY',
    zip: '40214',
    price: 250000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1050,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Cozy 3/2 home on a 9,849 sqft lot. Built in 1973. MLS ID: 1723787.',
    images: ['https://picsum.photos/seed/manslick/600/400'],
    source: 'Manual'
  },
  {
    address: '74313 Naneen Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40216',
    price: 237500,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1406,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Spacious 3/2 home on a 7,318 sqft lot. Built in 1962. MLS ID: 1723780.',
    images: ['https://picsum.photos/seed/naneen/600/400'],
    source: 'Manual'
  },
  {
    address: '87530 Beechspring Farm Blvd',
    city: 'Louisville',
    state: 'KY',
    zip: '40241',
    price: 1275000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Luxury estate on 0.49 acres. Built in 2007. MLS ID: 1723756.',
    images: ['https://picsum.photos/seed/beechspring/600/400'],
    source: 'Manual',
    featured: true
  },
  {
    address: '93205 W Broadway',
    city: 'Louisville',
    state: 'KY',
    zip: '40211',
    price: 145000,
    bedrooms: 4,
    bathrooms: 1,
    sqft: 1289,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Fixer‑upper with 4 beds and 1 bath on a 3,947 sqft lot. Built in 1923. MLS ID: 1723772.',
    images: ['https://picsum.photos/seed/wbroadway/600/400'],
    source: 'Manual'
  },
  {
    address: '10307 Brookfield View Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40245',
    price: 480000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 2140,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Beautiful 5/4 home on a 6,416 sqft lot. Built in 2014. MLS ID: 1723777.',
    images: ['https://picsum.photos/seed/brookfield/600/400'],
    source: 'Manual'
  },
  {
    address: '12219 W Oak St',
    city: 'Louisville',
    state: 'KY',
    zip: '40210',
    price: 110000,
    bedrooms: 5,
    bathrooms: 1,
    sqft: 1524,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Distressed property – Notice of Lis Pendens. MLS ID: 1723779.',
    images: ['https://picsum.photos/seed/woak/600/400'],
    source: 'Manual'
  },
  {
    address: '3504 Lodge Ln, Apt 129',
    city: 'Louisville',
    state: 'KY',
    zip: '40218',
    price: 69999,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 689,
    propertyType: 'Condo/Townhouse',
    status: 'Active',
    description: 'Notice of Foreclosure Sale. MLS ID: 1723709.',
    images: ['https://picsum.photos/seed/lodge/600/400'],
    source: 'Manual'
  },
  {
    address: '34913 Seville Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40272',
    price: 135000,
    bedrooms: 3,
    bathrooms: 1,
    sqft: 950,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723604.',
    images: ['https://picsum.photos/seed/seville/600/400'],
    source: 'Manual'
  },
  {
    address: '6718 Talon PI',
    city: 'Louisville',
    state: 'KY',
    zip: '40223',
    price: 830000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3396,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723268.',
    images: ['https://picsum.photos/seed/talon/600/400'],
    source: 'Manual',
    featured: true
  },
  {
    address: '73514 Sample Way',
    city: 'Louisville',
    state: 'KY',
    zip: '40245',
    price: 450000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2500,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723170.',
    images: ['https://picsum.photos/seed/sampleway/600/400'],
    source: 'Manual'
  },
  {
    address: '2839 Bexley Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40206',
    price: 1, // $1 (special case)
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1894,
    propertyType: 'Condo/Townhouse',
    status: 'Active',
    description: 'Notice of Lis Pendens – $1 listing price. MLS ID: 26016227.',
    images: ['https://picsum.photos/seed/bexley/600/400'],
    source: 'Manual'
  }
];

// Pending Listings
const pendingListings = [
  {
    address: '12518 Foxy Poise Rd',
    city: 'Louisville',
    state: 'KY',
    zip: '40220',
    price: 450000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2324,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/19/2026. MLS ID: 1723740.',
    images: ['https://picsum.photos/seed/foxy/600/400'],
    source: 'Manual'
  },
  {
    address: '26623 Holly Lake Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40291',
    price: 249900,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1245,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/19/2026. MLS ID: 1723567.',
    images: ['https://picsum.photos/seed/hollylake/600/400'],
    source: 'Manual'
  },
  {
    address: '13401 Kinross Blvd',
    city: 'Louisville',
    state: 'KY',
    zip: '40272',
    price: 220000,
    bedrooms: 3,
    bathrooms: 1,
    sqft: 1911,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/19/2026. MLS ID: 1721194.',
    images: ['https://picsum.photos/seed/kinross/600/400'],
    source: 'Manual'
  },
  {
    address: '113 La Fontenay Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40223',
    price: 155000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1345,
    propertyType: 'Condo/Townhouse',
    status: 'Pending',
    description: 'Pending as of 7/19/2026. MLS ID: 1722482.',
    images: ['https://picsum.photos/seed/lafontenay/600/400'],
    source: 'Manual'
  },
  {
    address: '53203 Morningview Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40242',
    price: 475000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2265,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/19/2026. MLS ID: 1714213.',
    images: ['https://picsum.photos/seed/morningview/600/400'],
    source: 'Manual'
  },
  {
    address: '68306 Aspen Ave',
    city: 'Louisville',
    state: 'KY',
    zip: '40258',
    price: 239900,
    bedrooms: 3,
    bathrooms: 1,
    sqft: 1500,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/18/2026. MLS ID: 1720986.',
    images: ['https://picsum.photos/seed/aspen/600/400'],
    source: 'Manual'
  },
  {
    address: '76705 Bedford Ln',
    city: 'Louisville',
    state: 'KY',
    zip: '40222',
    price: 400000,
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1400,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/18/2026. MLS ID: 1723587.',
    images: ['https://picsum.photos/seed/bedford/600/400'],
    source: 'Manual'
  },
  {
    address: '1007 Corn Island Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40207',
    price: 699000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3307,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Pending as of 7/18/2026. MLS ID: 1722735.',
    images: ['https://picsum.photos/seed/cornisland/600/400'],
    source: 'Manual',
    featured: true
  },
  {
    address: '1502 Eastbridge Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40223',
    price: 326000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1818,
    propertyType: 'Condo/Townhouse',
    status: 'Pending',
    description: 'Pending as of 7/18/2026. MLS ID: 1723269.',
    images: ['https://picsum.photos/seed/eastbridge/600/400'],
    source: 'Manual'
  },
  {
    address: '10249 El Conquistador PI',
    city: 'Louisville',
    state: 'KY',
    zip: '40220',
    price: 50000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    propertyType: 'Condo/Townhouse',
    status: 'Pending',
    description: 'Pending as of 7/18/2026. MLS ID: 1713789.',
    images: ['https://picsum.photos/seed/conquistador/600/400'],
    source: 'Manual'
  }
];

// Closed Listings
const closedListings = [
  {
    address: '125 S 1st St, Apt 10',
    city: 'Louisville',
    state: 'KY',
    zip: '40203',
    price: 111000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 705,
    propertyType: 'Condo/Townhouse',
    status: 'Closed',
    description: 'Closed 7/17/2026. MLS ID: 1715972.',
    images: ['https://picsum.photos/seed/s1st/600/400'],
    source: 'Manual'
  },
  {
    address: '2229 Albany Ave',
    city: 'Louisville',
    state: 'KY',
    zip: '40206',
    price: 400000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1182,
    propertyType: 'Residential',
    status: 'Closed',
    description: 'Closed 7/17/2026. MLS ID: 1719583.',
    images: ['https://picsum.photos/seed/albany/600/400'],
    source: 'Manual'
  },
  {
    address: '6704 Ashmead Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40291',
    price: 265000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1107,
    propertyType: 'Residential',
    status: 'Closed',
    description: 'Closed 7/17/2026. MLS ID: 1720506.',
    images: ['https://picsum.photos/seed/ashmead/600/400'],
    source: 'Manual'
  },
  {
    address: '12146 Belmont Park Cir',
    city: 'Louisville',
    state: 'KY',
    zip: '40243',
    price: 335000,
    bedrooms: 2,
    bathrooms: 3,
    sqft: 1614,
    propertyType: 'Residential',
    status: 'Closed',
    description: 'Closed 7/17/2026. MLS ID: 1721635.',
    images: ['https://picsum.photos/seed/belmont/600/400'],
    source: 'Manual'
  },
  {
    address: '1125 Berry Blvd',
    city: 'Louisville',
    state: 'KY',
    zip: '40215',
    price: 169000,
    bedrooms: 3,
    bathrooms: 1,
    sqft: 1386,
    propertyType: 'Residential',
    status: 'Closed',
    description: 'Closed 7/17/2026. MLS ID: 1720125.',
    images: ['https://picsum.photos/seed/berry/600/400'],
    source: 'Manual'
  }
];

// Distressed Listings (some are Active or Pending, but we'll mark as Distressed)
const distressedListings = [
  {
    address: '12219 W Oak St', // already added in active, but we'll keep separate for distressed category
    city: 'Louisville',
    state: 'KY',
    zip: '40210',
    price: 110000,
    bedrooms: 5,
    bathrooms: 1,
    sqft: 1524,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Notice of Lis Pendens. MLS ID: 1723779.',
    images: ['https://picsum.photos/seed/distressed1/600/400'],
    source: 'Manual'
  },
  {
    address: '3504 Lodge Ln, Apt 129',
    city: 'Louisville',
    state: 'KY',
    zip: '40218',
    price: 69999,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 689,
    propertyType: 'Condo/Townhouse',
    status: 'Active',
    description: 'Notice of Foreclosure Sale. MLS ID: 1723709.',
    images: ['https://picsum.photos/seed/distressed2/600/400'],
    source: 'Manual'
  },
  {
    address: '34913 Seville Dr',
    city: 'Louisville',
    state: 'KY',
    zip: '40272',
    price: 135000,
    bedrooms: 3,
    bathrooms: 1,
    sqft: 950,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723604.',
    images: ['https://picsum.photos/seed/distressed3/600/400'],
    source: 'Manual'
  },
  {
    address: '5701 Bartview Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40229',
    price: 245000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1211,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Notice of Foreclosure Sale. MLS ID: 1715106.',
    images: ['https://picsum.photos/seed/distressed4/600/400'],
    source: 'Manual'
  },
  {
    address: '4609 Slate Run Ct',
    city: 'Louisville',
    state: 'KY',
    zip: '40229',
    price: 274900,
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1603,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Notice of Lis Pendens. MLS ID: 1723003.',
    images: ['https://picsum.photos/seed/distressed5/600/400'],
    source: 'Manual'
  },
  {
    address: '6718 Talon PI',
    city: 'Louisville',
    state: 'KY',
    zip: '40223',
    price: 830000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3396,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723268.',
    images: ['https://picsum.photos/seed/distressed6/600/400'],
    source: 'Manual',
    featured: true
  },
  {
    address: '73514 Sample Way',
    city: 'Louisville',
    state: 'KY',
    zip: '40245',
    price: 450000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2500,
    propertyType: 'Residential',
    status: 'Active',
    description: 'Newly Filed Complaint. MLS ID: 1723170.',
    images: ['https://picsum.photos/seed/distressed7/600/400'],
    source: 'Manual'
  },
  {
    address: '815 Iroquois Ave',
    city: 'Louisville',
    state: 'KY',
    zip: '40214',
    price: 132000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1220,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Newly Filed Complaint. MLS ID: 1722598.',
    images: ['https://picsum.photos/seed/distressed8/600/400'],
    source: 'Manual'
  },
  {
    address: '2245 Beargrass Ave',
    city: 'Louisville',
    state: 'KY',
    zip: '40218',
    price: 150000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1206,
    propertyType: 'Residential',
    status: 'Pending',
    description: 'Newly Filed Complaint. MLS ID: 1717938.',
    images: ['https://picsum.photos/seed/distressed9/600/400'],
    source: 'Manual'
  },
  {
    address: '2839 Bexley Ct', // already added, but we'll keep
    city: 'Louisville',
    state: 'KY',
    zip: '40206',
    price: 1,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1894,
    propertyType: 'Condo/Townhouse',
    status: 'Active',
    description: 'Notice of Lis Pendens. MLS ID: 26016227.',
    images: ['https://picsum.photos/seed/distressed10/600/400'],
    source: 'Manual'
  }
];

// Combine all listings (avoid duplicates – we'll use a Set to track addresses)
const allListings = [...activeListings, ...pendingListings, ...closedListings];
// Add distressed listings that are not already included (we'll add them as separate if not already present)
// For simplicity, we'll just add all distressed listings; duplicates will be skipped by address check
const allAddresses = new Set(allListings.map(l => l.address));
for (const d of distressedListings) {
  if (!allAddresses.has(d.address)) {
    allListings.push(d);
  }
}

// ─── Market Stats from Report ─────────────────────────────────
const marketStats = [
  { metric: 'Median Estimated Property Value', value: '$279,230', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2026-06-30') },
  { metric: 'Median Estimated Property Value (Last Month)', value: '$266,910', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2026-05-31') },
  { metric: 'Median Estimated Property Value (Last 3 Months)', value: '$263,820', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2026-03-31') },
  { metric: 'Median Estimated Property Value (Last 12 Months)', value: '$262,940', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2025-06-30') },
  { metric: 'Median Estimated Property Value (Last 24 Months)', value: '$253,920', region: 'Louisville, KY', category: 'Price', source: 'RPR Valuation Model', date: new Date('2024-06-30') },
  { metric: 'Median Sold Price', value: '$284,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Median Sold Price (Last Month)', value: '$280,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-05-31') },
  { metric: 'Median Sold Price (Last 3 Months)', value: '$270,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-03-31') },
  { metric: 'Median Sold Price (Last 12 Months)', value: '$284,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2025-06-30') },
  { metric: 'Median Sold Price (Last 24 Months)', value: '$269,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2024-06-30') },
  { metric: 'Median Sold Price (Last 36 Months)', value: '$255,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2023-06-30') },
  { metric: 'Median List Price', value: '$282,000', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Median List Price (Last Month)', value: '$289,250', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-05-31') },
  { metric: 'Median List Price (Last 3 Months)', value: '$269,900', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2026-03-31') },
  { metric: 'Median List Price (Last 12 Months)', value: '$279,900', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2025-06-30') },
  { metric: 'Median List Price (Last 24 Months)', value: '$288,450', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2024-06-30') },
  { metric: 'Median List Price (Last 36 Months)', value: '$249,999', region: 'Louisville, KY', category: 'Price', source: 'MLS Data', date: new Date('2023-06-30') },
  { metric: 'Active Listings Count', value: '1,245', region: 'Louisville, KY', category: 'Inventory', source: 'RPR Data', date: new Date('2026-06-30') },
  { metric: 'Months of Inventory', value: '2.1 months', region: 'Louisville, KY', category: 'Inventory', source: 'RPR Data', date: new Date('2026-06-30') },
  { metric: 'Average Days on Market (Sold)', value: '28 days', region: 'Louisville, KY', category: 'Inventory', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'New Listings (June 2026)', value: '10', region: 'Louisville, KY', category: 'Inventory', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Pending Sales (June 2026)', value: '10', region: 'Louisville, KY', category: 'Sales', source: 'MLS Data', date: new Date('2026-06-30') },
  { metric: 'Closed Sales (June 2026)', value: '10', region: 'Louisville, KY', category: 'Sales', source: 'MLS Data', date: new Date('2026-06-30') }
];

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

  // Keep existing news and events from previous seed or add a few placeholders
  // We'll keep the previous ones if they exist, but we can add some from the report
  // The report doesn't have news/events, so we'll skip or keep previous.

  console.log('✅ Seed completed successfully! Bots will post every 2-5 minutes.');
  process.exit(0);
}

seed();