const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Call‑to‑action pool ──────────────────────────────────────
const CTAS = [
  '📞 Call or text Zerric at 502-299-5252 for more info!',
  '🌐 Check out my main site at zerric.com for all listings.',
  '📧 Email me at zerricdotcom@gmail.com – I reply fast!',
  '🔍 Think this is a good deal? Let me know!',
  '🏡 Want to see this home? DM me for a private tour.',
  '📲 Schedule a showing – just text 502-299-5252.',
  '💬 What do you think of the market right now?',
  '📈 Looking for investment opportunities? Let’s chat!',
  '🏠 Thinking of selling? I can give you a free valuation.',
  '🔄 Market moving fast – don’t wait too long!'
];

// ─── Pexels image fetcher ─────────────────────────────────────
let imageCache = {};
let cacheTimeout = 5 * 60 * 1000; // 5 minutes

async function fetchPexelsImage(query) {
  // Check cache first
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
      
      // Cache the result
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

// ─── Listing Templates ────────────────────────────────────────
const listingTemplates = [
  (listing) => `🏡 New listing alert! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 80)}... ${random(CTAS)} #LouisvilleRealEstate`,
  (listing) => `Just hit the market: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 60)}... ${random(CTAS)} #KYHomes`,
  (listing) => `🚀 Hot property! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}. Priced at $${listing.price.toLocaleString()}. Don't miss out! ${random(CTAS)} #LouisvilleRealEstate`,
  (listing) => `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} – only $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 70)}... ${random(CTAS)}`,
  (listing) => `✨ Just listed: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA with ${listing.sqft || '?'} sqft. $${listing.price.toLocaleString()} – act fast! ${random(CTAS)}`
];

// ─── Stat Templates ───────────────────────────────────────────
const statTemplates = [
  (stat) => `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${stat.source || 'MLS Data'}. ${random(CTAS)} #KYMarket`,
  (stat) => `💰 Market update: ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(CTAS)}`,
  (stat) => `📈 ${stat.metric}: ${stat.value}. ${stat.source || ''}. ${random(CTAS)} #LouisvilleRealEstate`,
  (stat) => `💡 Did you know? ${stat.metric} in ${stat.region} is ${stat.value}. ${random(CTAS)}`,
  (stat) => `🏦 ${stat.metric}: ${stat.value}. Great time to buy or sell? ${random(CTAS)}`
];

// ─── News Templates ───────────────────────────────────────────
const newsTemplates = [
  (news) => `📰 ${news.headline}: ${news.summary.slice(0, 100)}... ${news.link ? `Read more: ${news.link}` : ''} ${random(CTAS)} #KYNews`,
  (news) => `🔔 Big news: ${news.headline}. ${news.summary.slice(0, 80)}... ${random(CTAS)}`,
  (news) => `🏙️ ${news.headline} – ${news.summary.slice(0, 90)}... ${random(CTAS)}`,
  (news) => `📢 ${news.headline}. ${news.summary.slice(0, 70)}... ${random(CTAS)} #Louisville`,
  (news) => `💥 ${news.headline}: ${news.summary.slice(0, 80)}... ${random(CTAS)}`
];

// ─── Event Templates ──────────────────────────────────────────
const eventTemplates = [
  (event) => `📅 ${event.title} – ${event.description?.slice(0, 60)}... ${event.location || ''} ${random(CTAS)} #Event`,
  (event) => `🗓️ Mark your calendar: ${event.title}. ${event.description?.slice(0, 70)}... ${random(CTAS)}`,
  (event) => `📍 ${event.title} at ${event.location || 'TBD'}. ${event.description?.slice(0, 60)}... ${random(CTAS)}`
];

// ─── Conversation starter templates (no data) ────────────────
const conversationStarters = [
  `🏘️ What's your favorite Louisville neighborhood? I'd love to hear! ${random(CTAS)}`,
  `📊 Are you watching the market? I'm seeing some interesting trends. ${random(CTAS)}`,
  `🌳 Who else loves the Highlands? Let's chat about it! ${random(CTAS)}`,
  `🏠 Thinking of buying or selling? I'm here to help! ${random(CTAS)}`,
  `💬 What's the best part of living in Louisville? ${random(CTAS)}`
];

// ─── Map content type to Pexels search query ──────────────────
function getPexelsQuery(dataItem, type) {
  if (type === 'listing') {
    const keywords = ['house', 'home', 'real estate', 'property'];
    if (dataItem.address) {
      const parts = dataItem.address.split(' ');
      const street = parts.slice(0, 2).join(' ');
      keywords.unshift(street);
    }
    return random(keywords);
  }
  if (type === 'stat') {
    return random(['city', 'skyline', 'downtown', 'urban', 'buildings']);
  }
  if (type === 'news') {
    return random(['city', 'news', 'development', 'construction']);
  }
  if (type === 'event') {
    return random(['people', 'meeting', 'community', 'event']);
  }
  return 'louisville';
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

  // 15% chance to post a conversation starter
  if (Math.random() < 0.15) {
    postContent = random(conversationStarters);
    dataType = 'conversation';
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
        if (rand < 0.35) {
          dataItem = await getRandomItem(Listing);
          if (dataItem) { templateSet = listingTemplates; type = 'listing'; }
        } else if (rand < 0.65) {
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

  // If no content, fallback
  if (!postContent) {
    postContent = `👋 ${botUser.name} here! Follow me for the latest Louisville real estate insights. ${random(CTAS)} #ScrollCity`;
    dataType = 'fallback';
  }

  // ─── Fetch a Pexels image (35% chance, only if no image already) ──
  if (!image && Math.random() < 0.35) {
    let query = 'louisville';
    if (dataType === 'listing') query = 'house';
    else if (dataType === 'stat') query = 'city';
    else if (dataType === 'news') query = 'city';
    else if (dataType === 'event') query = 'people';
    else if (dataType === 'conversation') query = 'community';
    
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