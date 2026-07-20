const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Website Plug ──────────────────────────────────────────────
const WEBSITE = 'zerric.com';
const AGENT_NAME = 'Zerric';

// ─── Trending Topics (curated from real Louisville market data) ──
const TRENDING_TOPICS = [
  {
    headline: 'Louisville inventory up 39% year-over-year',
    detail: 'There are now more than 4,000 homes on the market in Louisville – a 39% increase from last year. Buyers have more choices than they’ve had in years.',
    source: 'GLAR / Spectrum News'
  },
  {
    headline: 'Median home price holds steady at $265K',
    detail: 'The median home price in Louisville remains around $265,000, with homes selling close to asking price. A stable market for both buyers and sellers.',
    source: 'GLAR / Homes.com'
  },
  {
    headline: 'Homes spending more time on the market',
    detail: 'The average days on market has risen to 49 days, up from previous years. This gives buyers more time to make informed decisions.',
    source: 'GLAR / Spectrum News'
  },
  {
    headline: 'Average home sale price tops $350,000',
    detail: 'The average home sale price in Louisville is now over $350,000, up 3% year-over-year. A strong sign of continued appreciation.',
    source: 'GLAR'
  },
  {
    headline: 'City proposes "neighborhood housing" expansion',
    detail: 'Louisville officials are proposing to allow duplexes, townhouses, and other housing types in areas that currently only permit single‑family homes. The goal: more options and lower prices.',
    source: 'Homes.com News'
  },
  {
    headline: 'One Park development awarded $62M in state incentives',
    detail: 'The massive One Park development in Irish Hill is moving forward with hundreds of apartments, a hotel, shops, and restaurants.',
    source: 'WAVE 3 News'
  },
  {
    headline: 'Louisville named one of the Midwest’s most stable real estate markets',
    detail: 'Colliers calls Louisville a "Steady Eddie" market – stable, resilient, and attractive to investors seeking risk‑adjusted returns.',
    source: 'Colliers'
  },
  {
    headline: 'Multifamily demand remains strong in Louisville',
    detail: 'Renter demand is steady, new supply is slowing, and housing affordability challenges continue to support occupancy and rent growth.',
    source: 'Colliers'
  },
  {
    headline: 'Kentucky ranks 13th among hottest US housing markets for 2026',
    detail: 'Kentucky continues to attract buyers and investors, with Lexington-Fayette leading the state as the top metro area.',
    source: 'Kentucky.com'
  },
  {
    headline: 'Housing inventory shortage – city needs over 50,000 more units',
    detail: 'A 2024 housing needs assessment found Louisville is short more than 50,000 housing units for people earning 50% or less of the area median income.',
    source: 'Homes.com News'
  }
];

// ─── Call‑to‑action pool (all point to Zerric) ──────────────
const CTAS = [
  `🏠 Have questions about the Louisville market? Contact Zerric at ${WEBSITE} – he's the local expert!`,
  `📞 Thinking of buying or selling? Zerric can help – visit ${WEBSITE} to get started.`,
  `📧 Want to know what your home is worth? Zerric offers free valuations – check out ${WEBSITE}.`,
  `🔍 Seeing a home you like? Reach out to Zerric at ${WEBSITE} for a private showing.`,
  `📈 Not sure if now is the right time? Zerric can walk you through it – ${WEBSITE}.`,
  `🏡 Ready to make a move? Zerric is just a click away at ${WEBSITE}.`,
  `💬 Have questions about today's market? Zerric has the answers – visit ${WEBSITE}.`,
  `📱 Thinking of selling? Zerric can help you get top dollar – ${WEBSITE}.`,
  `🤔 Wondering what this means for you? Zerric can explain – reach out at ${WEBSITE}.`,
  `🏘️ Looking for the perfect neighborhood? Zerric knows Louisville inside out – ${WEBSITE}.`
];

// ─── Trending Topic Templates ──────────────────────────────────
const trendingTemplates = [
  (topic) => `📊 ${topic.headline}. ${topic.detail} ${random(CTAS)} #LouisvilleRealEstate`,
  (topic) => `🔍 Market update: ${topic.headline}. ${topic.detail} ${random(CTAS)} #KYHomes`,
  (topic) => `📈 Did you catch this? ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `🏙️ Louisville market news: ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `💡 ${topic.headline}. ${topic.detail} ${random(CTAS)} #Louisville`
];

// ─── Listing Templates (with Zerric plug) ────────────────────
const listingTemplates = [
  (listing) => `🏡 New listing alert! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 80)}... ${random(CTAS)} #LouisvilleRealEstate`,
  (listing) => `Just hit the market: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 60)}... ${random(CTAS)} #KYHomes`,
  (listing) => `🚀 Hot property! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}. Priced at $${listing.price.toLocaleString()}. ${random(CTAS)} #LouisvilleRealEstate`,
  (listing) => `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} – only $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 70)}... ${random(CTAS)}`,
  (listing) => `✨ Just listed: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA with ${listing.sqft || '?'} sqft. $${listing.price.toLocaleString()} – ${random(CTAS)}`
];

// ─── Stat Templates (with Zerric plug) ──────────────────────
const statTemplates = [
  (stat) => `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${stat.source || 'MLS Data'}. ${random(CTAS)} #KYMarket`,
  (stat) => `💰 Market update: ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(CTAS)}`,
  (stat) => `📈 ${stat.metric}: ${stat.value}. ${stat.source || ''}. ${random(CTAS)} #LouisvilleRealEstate`,
  (stat) => `💡 Did you know? ${stat.metric} in ${stat.region} is ${stat.value}. ${random(CTAS)}`,
  (stat) => `🏦 ${stat.metric}: ${stat.value}. ${random(CTAS)}`
];

// ─── News Templates (with Zerric plug) ──────────────────────
const newsTemplates = [
  (news) => `📰 ${news.headline}: ${news.summary.slice(0, 100)}... ${random(CTAS)} #KYNews`,
  (news) => `🔔 Big news: ${news.headline}. ${news.summary.slice(0, 80)}... ${random(CTAS)}`,
  (news) => `🏙️ ${news.headline} – ${news.summary.slice(0, 90)}... ${random(CTAS)}`,
  (news) => `📢 ${news.headline}. ${news.summary.slice(0, 70)}... ${random(CTAS)} #Louisville`,
  (news) => `💥 ${news.headline}: ${news.summary.slice(0, 80)}... ${random(CTAS)}`
];

// ─── Event Templates (with Zerric plug) ──────────────────────
const eventTemplates = [
  (event) => `📅 ${event.title} – ${event.description?.slice(0, 60)}... ${event.location || ''} ${random(CTAS)} #Event`,
  (event) => `🗓️ Mark your calendar: ${event.title}. ${event.description?.slice(0, 70)}... ${random(CTAS)}`,
  (event) => `📍 ${event.title} at ${event.location || 'TBD'}. ${event.description?.slice(0, 60)}... ${random(CTAS)}`
];

// ─── Pexels image fetcher ─────────────────────────────────────
let imageCache = {};
const cacheTimeout = 5 * 60 * 1000; // 5 minutes

async function fetchPexelsImage(query) {
  const cacheKey = query.toLowerCase().trim();
  if (imageCache[cacheKey] && (Date.now() - imageCache[cacheKey].timestamp < cacheTimeout)) {
    return imageCache[cacheKey].url;
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ PEXELS_API_KEY not set – skipping Pexels images');
    return null;
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${Math.floor(Math.random() * 5) + 1}`;
    const response = await fetch(url, {
      headers: { 'Authorization': apiKey }
    });

    if (!response.ok) {
      console.warn(`⚠️ Pexels API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = random(data.photos);
      const imageUrl = photo.src.medium || photo.src.large || photo.src.original;
      
      imageCache[cacheKey] = {
        url: imageUrl,
        timestamp: Date.now()
      };
      
      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error('❌ Pexels fetch error:', error.message);
    return null;
  }
}

// ─── Pick data ─────────────────────────────────────────────────
async function getRandomItem(model, filter = {}) {
  const count = await model.countDocuments(filter);
  if (count === 0) return null;
  const randomIndex = Math.floor(Math.random() * count);
  return await model.findOne(filter).skip(randomIndex);
}

// ─── Main bot posting function ───────────────────────────────
async function postFromBot(botUsername) {
  const botUser = await User.findOne({ username: botUsername, isBot: true });
  if (!botUser) throw new Error('Bot not found');

  const niche = botUser.botNiche || 'General';
  let postContent = '';
  let image = '';
  let video = '';
  let dataType = '';

  // 25% chance to post a trending topic (instead of always using data)
  if (Math.random() < 0.25) {
    const topic = random(TRENDING_TOPICS);
    const template = random(trendingTemplates);
    postContent = template(topic);
    dataType = 'trending';
  } else {
    // Pick data based on niche
    let dataItem = null;
    let templateSet = null;
    let type = '';

    switch (niche) {
      case 'Finance':
        dataItem = await getRandomItem(MarketStat, { category: 'Economic' });
        if (dataItem) { templateSet = statTemplates; type = 'stat'; }
        break;
      case 'Market Data':
        dataItem = await getRandomItem(MarketStat, { category: 'Price' });
        if (dataItem) { templateSet = statTemplates; type = 'stat'; }
        break;
      case 'Construction':
        dataItem = await getRandomItem(NewsItem, { category: 'Development' });
        if (dataItem) { templateSet = newsTemplates; type = 'news'; }
        break;
      case 'Neighborhood':
        dataItem = await getRandomItem(Event, { type: 'Community Meeting' });
        if (dataItem) { templateSet = eventTemplates; type = 'event'; }
        break;
      case 'Investment':
        dataItem = await getRandomItem(Listing, { propertyType: 'Multi-Family' });
        if (dataItem) { templateSet = listingTemplates; type = 'listing'; }
        break;
      default: // General
        const rand = Math.random();
        if (rand < 0.30) {
          dataItem = await getRandomItem(Listing);
          if (dataItem) { templateSet = listingTemplates; type = 'listing'; }
        } else if (rand < 0.55) {
          dataItem = await getRandomItem(MarketStat);
          if (dataItem) { templateSet = statTemplates; type = 'stat'; }
        } else {
          dataItem = await getRandomItem(NewsItem);
          if (dataItem) { templateSet = newsTemplates; type = 'news'; }
        }
        break;
    }

    if (dataItem && templateSet) {
      const template = random(templateSet);
      postContent = template(dataItem);
      dataType = type;
      
      // If it's a listing, use its first image if available
      if (dataItem.images && dataItem.images.length > 0) {
        image = dataItem.images[0];
      }
    }
  }

  // If no content, fallback to a trending topic
  if (!postContent) {
    const topic = random(TRENDING_TOPICS);
    const template = random(trendingTemplates);
    postContent = template(topic);
    dataType = 'trending-fallback';
  }

  // ─── Fetch a Pexels image (35% chance, only if no image already) ──
  if (!image && Math.random() < 0.35) {
    let query = 'louisville';
    if (dataType === 'listing') query = 'house';
    else if (dataType === 'stat') query = 'city';
    else if (dataType === 'news') query = 'city';
    else if (dataType === 'event') query = 'people';
    else if (dataType === 'trending' || dataType === 'trending-fallback') query = 'louisville skyline';
    
    const pexelsImage = await fetchPexelsImage(query);
    if (pexelsImage) {
      image = pexelsImage;
    }
  }

  // Create the post
  const post = await Post.create({
    user: botUser._id,
    userName: botUser.name,
    userHandle: botUser.username,
    userAvatar: botUser.avatar,
    content: postContent,
    image: image || '',
    video: video || '',
    isBot: true
  });

  // Update lastPostAt
  await BotPersona.findOneAndUpdate(
    { username: botUsername },
    { lastPostAt: new Date() },
    { upsert: true }
  );

  return post;
}

// ─── Scheduler ─────────────────────────────────────────────────
async function runBotScheduler() {
  const bots = await BotPersona.find({ active: true });
  for (const bot of bots) {
    const now = new Date();
    const last = bot.lastPostAt || new Date(0);
    const minutesSince = (now - last) / (1000 * 60);
    if (minutesSince >= bot.postFrequency) {
      try {
        await postFromBot(bot.username);
        console.log(`✅ Bot ${bot.username} posted at ${now.toISOString()}`);
      } catch (err) {
        console.error(`❌ Bot ${bot.username} failed:`, err.message);
      }
    }
  }
}

// ─── Start scheduler ──────────────────────────────────────────
function startBotService() {
  setInterval(runBotScheduler, 60000);
  setTimeout(runBotScheduler, 5000);
}

module.exports = { startBotService, postFromBot };