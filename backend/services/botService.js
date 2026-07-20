const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');
const TrendingTopic = require('../models/TrendingTopic');

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Website URLs ──────────────────────────────────────────────
const MAIN_URL = 'https://zerric.com';
const MORTGAGE_URL = 'https://zerric.com/mortgage-calculator';
const GUESTBOOK_URL = 'https://zerric.com/guest-book';
const SEARCH_URL = 'https://zerric.com/property-search';

// ─── Trending Topics (static fallback) ────────────────────────
const STATIC_TOPICS = [
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
  // ... (keep all the existing static topics)
];

// ─── CTAs ──────────────────────────────────────────────────────
const CTAS = [
  // ... (keep the existing CTAs array)
];

// ─── Listing Templates ────────────────────────────────────────
const listingTemplates = [
  (listing) => {
    let msg = `🏡 New listing alert! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 80)}...`;
    if (listing.url) msg += ` See the listing here: ${listing.url}`;
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    let msg = `Just hit the market: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 60)}...`;
    if (listing.url) msg += ` Check it out: ${listing.url}`;
    msg += ` ${random(CTAS)} #KYHomes`;
    return msg;
  },
  (listing) => {
    let msg = `🚀 Hot property! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}. Priced at $${listing.price.toLocaleString()}.`;
    if (listing.url) msg += ` See the listing here: ${listing.url}`;
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} – only $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 70)}...`;
    if (listing.url) msg += ` View details: ${listing.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (listing) => {
    let msg = `✨ Just listed: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA with ${listing.sqft || '?'} sqft. $${listing.price.toLocaleString()} – `;
    if (listing.url) msg += ` More info: ${listing.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  }
];

// ─── Stat Templates (with URL) ────────────────────────────────
const statTemplates = [
  (stat) => {
    let msg = `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${stat.source || 'MLS Data'}.`;
    if (stat.url) msg += ` More info: ${stat.url}`;
    msg += ` ${random(CTAS)} #KYMarket`;
    return msg;
  },
  (stat) => {
    let msg = `💰 Market update: ${stat.metric} is now ${stat.value} in ${stat.region}.`;
    if (stat.url) msg += ` Check it out: ${stat.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (stat) => {
    let msg = `📈 ${stat.metric}: ${stat.value}. ${stat.source || ''}.`;
    if (stat.url) msg += ` See details: ${stat.url}`;
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (stat) => {
    let msg = `💡 Did you know? ${stat.metric} in ${stat.region} is ${stat.value}.`;
    if (stat.url) msg += ` Full report: ${stat.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (stat) => {
    let msg = `🏦 ${stat.metric}: ${stat.value}.`;
    if (stat.url) msg += ` Learn more: ${stat.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  }
];

// ─── News Templates (with URL) ────────────────────────────────
const newsTemplates = [
  (news) => {
    let msg = `📰 ${news.headline}: ${news.summary.slice(0, 100)}...`;
    if (news.url) msg += ` Read more: ${news.url}`;
    msg += ` ${random(CTAS)} #KYNews`;
    return msg;
  },
  (news) => {
    let msg = `🔔 Big news: ${news.headline}. ${news.summary.slice(0, 80)}...`;
    if (news.url) msg += ` Details: ${news.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (news) => {
    let msg = `🏙️ ${news.headline} – ${news.summary.slice(0, 90)}...`;
    if (news.url) msg += ` Full story: ${news.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (news) => {
    let msg = `📢 ${news.headline}. ${news.summary.slice(0, 70)}...`;
    if (news.url) msg += ` See more: ${news.url}`;
    msg += ` ${random(CTAS)} #Louisville`;
    return msg;
  },
  (news) => {
    let msg = `💥 ${news.headline}: ${news.summary.slice(0, 80)}...`;
    if (news.url) msg += ` Find out more: ${news.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  }
];

// ─── Event Templates (with URL) ──────────────────────────────
const eventTemplates = [
  (event) => {
    let msg = `📅 ${event.title} – ${event.description?.slice(0, 60)}... ${event.location || ''}`;
    if (event.url) msg += ` Register/Info: ${event.url}`;
    msg += ` ${random(CTAS)} #Event`;
    return msg;
  },
  (event) => {
    let msg = `🗓️ Mark your calendar: ${event.title}. ${event.description?.slice(0, 70)}...`;
    if (event.url) msg += ` More details: ${event.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (event) => {
    let msg = `📍 ${event.title} at ${event.location || 'TBD'}. ${event.description?.slice(0, 60)}...`;
    if (event.url) msg += ` Sign up: ${event.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  }
];

// ─── Trending Topic Templates (with URL) ─────────────────────
const trendingTemplates = [
  (topic) => {
    let msg = `📊 ${topic.headline}. ${topic.detail}`;
    if (topic.url) msg += ` Read more: ${topic.url}`;
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (topic) => {
    let msg = `🔍 Market update: ${topic.headline}. ${topic.detail}`;
    if (topic.url) msg += ` Details: ${topic.url}`;
    msg += ` ${random(CTAS)} #KYHomes`;
    return msg;
  },
  (topic) => {
    let msg = `📈 Did you catch this? ${topic.headline}. ${topic.detail}`;
    if (topic.url) msg += ` See more: ${topic.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (topic) => {
    let msg = `🏙️ Louisville market news: ${topic.headline}. ${topic.detail}`;
    if (topic.url) msg += ` Full article: ${topic.url}`;
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (topic) => {
    let msg = `💡 ${topic.headline}. ${topic.detail}`;
    if (topic.url) msg += ` Find out more: ${topic.url}`;
    msg += ` ${random(CTAS)} #Louisville`;
    return msg;
  }
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

  // 25% chance to post a trending topic (from DB if available, else static)
  if (Math.random() < 0.25) {
    // Try to get from DB first
    let topic = await getRandomItem(TrendingTopic, { active: true });
    if (!topic) {
      // fallback to static
      topic = random(STATIC_TOPICS);
    }
    const template = random(trendingTemplates);
    postContent = template(topic);
    dataType = 'trending';
  } else {
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
      default:
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
      
      if (dataItem.images && dataItem.images.length > 0) {
        image = dataItem.images[0];
      }
    }
  }

  // If no content, fallback to a static trending topic
  if (!postContent) {
    const topic = random(STATIC_TOPICS);
    const template = random(trendingTemplates);
    postContent = template(topic);
    dataType = 'trending-fallback';
  }

  // ─── Fetch a Pexels image (35% chance) ──
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