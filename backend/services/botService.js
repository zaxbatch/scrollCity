const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Website URLs (no trailing slash, no punctuation) ───────
const MAIN_URL = 'https://zerric.com';
const MORTGAGE_URL = 'https://zerric.com/mortgage-calculator';
const GUESTBOOK_URL = 'https://zerric.com/guest-book';
const SEARCH_URL = 'https://zerric.com/property-search';

// ─── Trending Topics ──────────────────────────────────────────
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

// ─── Expanded Call‑to‑action pool ────────────────────────────────
const CTAS = [
  // ----- Website links (clean URLs, no trailing punctuation) -----
  `🏠 Have questions? Visit my website at ${MAIN_URL} for all things real estate.`,
  `📞 Thinking of buying or selling? Start with my site: ${MAIN_URL}`,
  `📧 Want a free home valuation? Check out ${MAIN_URL}`,
  `🔍 See a home you like? Reach out via my site: ${MAIN_URL}`,
  `📈 Not sure if now is the right time? I can walk you through it – ${MAIN_URL}`,
  `🏡 Ready to make a move? Visit ${MAIN_URL} to get started.`,
  `📱 Thinking of selling? I can help you get top dollar – ${MAIN_URL}`,
  `📐 Calculate your mortgage payments easily with my mortgage calculator: ${MORTGAGE_URL}`,
  `📝 Sign my guest book and share your thoughts: ${GUESTBOOK_URL}`,
  `🔎 Find your dream home with my property search tool: ${SEARCH_URL}`,
  `💬 I’m always available to chat – just click the chat icon on my site (lower right) at ${MAIN_URL}.`,
  `🤝 Looking for a trusted Realtor? I’m right here at ${MAIN_URL} – let’s connect!`,
  `📲 You can talk to me directly via the chat widget on my site: ${MAIN_URL} (look for the icon at the bottom right).`,
  `🏘️ Explore all my listings and resources at ${MAIN_URL}`,

  // ----- Engagement and soft prompts (without links) -----
  `💬 What do you think about today’s market? Drop a comment below – I’d love to hear!`,
  `🗣️ Follow me for more local insights and updates.`,
  `📢 Let me know what you think – your feedback helps me serve you better.`,
  `⭐ If you found this useful, please share it with a friend.`,
  `🤔 Wondering how this affects you? I’d be happy to break it down – just ask!`,
  `📲 Have a question? I’m just a message away!`,
  `👍 Like this post? Hit the like button and let me know!`,
  `💡 Did you know? I have a ton of resources on my site to help you navigate the market.`,
  `🌟 Thinking of making a move? I’m here to guide you every step of the way.`,
  `📊 Want more data like this? Follow me for regular market snapshots.`,
  `🏠 I know a Realtor who can help – and it’s me! 😉`,
  `💬 Let’s start a conversation – what’s your biggest real estate question?`,
  `📢 I’d love your opinion: what neighborhood should I cover next?`,
  `👋 Thanks for being part of this community – your support means a lot.`,
  `✨ If you’re curious about your home’s value, I can help you find out.`,
  `📞 I’m always available for a no‑pressure chat – reach out anytime.`,
  `📲 Have you signed my guest book yet? I’d love to hear your story!`,
  `🌟 I’m here to make your real estate journey smooth and successful.`,
  `💬 What’s your favorite Louisville neighborhood? Let me know in the comments!`,
  `📢 Tag someone who needs to see this!`,
  `🔔 Follow me to stay up‑to‑date on all things real estate in Kentucky.`,
  `🏘️ I’m passionate about helping families find their perfect home – let’s chat!`,
  `📈 Did you know I have a mortgage calculator on my site? Check it out at ${MORTGAGE_URL}`,
  `📝 Thinking of selling? I can help you get the best price – reach out via ${MAIN_URL}`,
  `🔎 Searching for a new home? Use my property search tool at ${SEARCH_URL}`,
  `💬 I’m just a click away – let’s talk about your real estate goals!`,
  `🎯 Let me know what you’d like to see more of in this community.`,
  `📲 I’m always active on my site – drop me a message and I’ll reply fast.`
];

// ─── Trending Topic Templates ──────────────────────────────────
const trendingTemplates = [
  (topic) => `📊 ${topic.headline}. ${topic.detail} ${random(CTAS)} #LouisvilleRealEstate`,
  (topic) => `🔍 Market update: ${topic.headline}. ${topic.detail} ${random(CTAS)} #KYHomes`,
  (topic) => `📈 Did you catch this? ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `🏙️ Louisville market news: ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `💡 ${topic.headline}. ${topic.detail} ${random(CTAS)} #Louisville`
];

// ─── UPDATED Listing Templates (with url support) ──────────────
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

// ─── Stat Templates ───────────────────────────────────────────
const statTemplates = [
  (stat) => `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${stat.source || 'MLS Data'}. ${random(CTAS)} #KYMarket`,
  (stat) => `💰 Market update: ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(CTAS)}`,
  (stat) => `📈 ${stat.metric}: ${stat.value}. ${stat.source || ''}. ${random(CTAS)} #LouisvilleRealEstate`,
  (stat) => `💡 Did you know? ${stat.metric} in ${stat.region} is ${stat.value}. ${random(CTAS)}`,
  (stat) => `🏦 ${stat.metric}: ${stat.value}. ${random(CTAS)}`
];

// ─── News Templates ───────────────────────────────────────────
const newsTemplates = [
  (news) => `📰 ${news.headline}: ${news.summary.slice(0, 100)}... ${random(CTAS)} #KYNews`,
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

  // 25% chance to post a trending topic
  if (Math.random() < 0.25) {
    const topic = random(TRENDING_TOPICS);
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

  // If no content, fallback to a trending topic
  if (!postContent) {
    const topic = random(TRENDING_TOPICS);
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