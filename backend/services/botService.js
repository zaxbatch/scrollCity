const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');
const TrendingTopic = require('../models/TrendingTopic');
const MediaItem = require('../models/MediaItem'); // <-- NEW

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Helper: safe URL formatting ──────────────────────────────
const formatListingUrl = (listing) => {
  if (listing.url && listing.url.trim()) {
    return ` See the listing here: ${listing.url.trim()}`;
  }
  return '';
};

// ─── Website URLs (no trailing punctuation) ────────────────────
const MAIN_URL = 'https://zerric.com';
const MORTGAGE_URL = 'https://zerric.com/mortgage-calculator';
const GUESTBOOK_URL = 'https://zerric.com/guest-book';
const SEARCH_URL = 'https://zerric.com/property-search';

// ─── Fallback trending topics (if DB is empty) ────────────────
const FALLBACK_TOPICS = [
  {
    headline: 'Louisville inventory up 39% year-over-year',
    detail: 'There are now more than 4,000 homes on the market in Louisville – a 39% increase from last year.'
  },
  {
    headline: 'Median home price holds steady at $265K',
    detail: 'The median home price in Louisville remains around $265,000, with homes selling close to asking price.'
  },
  {
    headline: 'Homes spending more time on the market',
    detail: 'The average days on market has risen to 49 days, up from previous years.'
  }
];

// ─── Get trending topics from database ─────────────────────────
async function getTrendingTopicsFromDB() {
  try {
    const topics = await TrendingTopic.find({ active: true }).sort({ createdAt: -1 });
    if (topics.length === 0) {
      console.warn('⚠️ No active trending topics found in DB – using fallback topics');
      return FALLBACK_TOPICS;
    }
    return topics;
  } catch (err) {
    console.error('❌ Error fetching trending topics from DB:', err.message);
    return FALLBACK_TOPICS;
  }
}

// ─── CTAs (no periods after URLs) ─────────────────────────────
const CTAS = [
  // ----- Website plugs (no period after URL) -----
  `🏠 Have questions? Visit my website at ${MAIN_URL} for all things real estate`,
  `📞 Thinking of buying or selling? Zerric can help – start at ${MAIN_URL}`,
  `📧 Want a free home valuation? Zerric offers them at ${MAIN_URL}`,
  `🔍 See a home you like? Reach out to Zerric via ${MAIN_URL}`,
  `📈 Not sure if now is the right time? Zerric can walk you through it – ${MAIN_URL}`,
  `🏡 Ready to make a move? Zerric is ready to help – start at ${MAIN_URL}`,
  `📱 Thinking of selling? Zerric can help you get top dollar – ${MAIN_URL}`,
  `📐 Calculate your mortgage payments easily with Zerric's mortgage calculator: ${MORTGAGE_URL}`,
  `📝 Sign Zerric's guest book and share your thoughts: ${GUESTBOOK_URL}`,
  `🔎 Find your dream home with Zerric's property search tool: ${SEARCH_URL}`,
  `💬 Zerric is always available to chat – just click the chat icon on his site (lower right) at ${MAIN_URL}`,
  `🤝 Looking for a trusted Realtor? Zerric is right here at ${MAIN_URL} – let's connect`,
  `📲 You can talk to Zerric directly via the chat widget on his site: ${MAIN_URL} (look for the icon at the bottom right)`,
  `🏘️ Explore all of Zerric's listings and resources at ${MAIN_URL}`,
  `📞 Zerric is just a call or click away – visit ${MAIN_URL} to get started`,

  // ----- Referral to Zerric (without website link) -----
  `💬 Have questions about today's market? Zerric has the answers – just reach out`,
  `📞 Zerric is available to chat about your real estate goals – contact him anytime`,
  `🤔 Wondering what this means for you? Zerric can explain in plain language`,
  `🏘️ Looking for the perfect neighborhood? Zerric knows Louisville inside out`,
  `📊 Want more insights like this? Zerric would love to connect with you`,
  `⭐ Zerric is here to help you navigate the Louisville market with confidence`,
  `📲 Zerric offers free, no‑pressure consultations – reach out to learn more`,
  `🏠 I know a Realtor who can help – and it's Zerric 😉`,

  // ----- Engagement prompts (comments, follows, feedback) -----
  `💬 What do you think about today's market? Drop a comment below – I'd love to hear`,
  `🗣️ Follow me for more local insights and updates`,
  `📢 Let me know what you think – your feedback helps me serve you better`,
  `⭐ If you found this useful, please share it with a friend`,
  `📲 Have a question? I'm just a message away`,
  `👍 Like this post? Hit the like button and let me know`,
  `🌟 Thinking of making a move? I'm here to guide you every step of the way`,
  `📊 Want more data like this? Follow me for regular market snapshots`,
  `💬 Let's start a conversation – what's your biggest real estate question`,
  `📢 I'd love your opinion: what neighborhood should I cover next`,
  `👋 Thanks for being part of this community – your support means a lot`,
  `✨ If you're curious about your home's value, I can help you find out`,
  `📲 Have you signed my guest book yet? I'd love to hear your story`,
  `🌟 I'm here to make your real estate journey smooth and successful`,
  `💬 What's your favorite Louisville neighborhood? Let me know in the comments`,
  `📢 Tag someone who needs to see this`,
  `🔔 Follow me to stay up‑to‑date on all things real estate in Kentucky`,
  `🏘️ I'm passionate about helping families find their perfect home – let's chat`,
  `💬 I'm just a click away – let's talk about your real estate goals`,
  `🎯 Let me know what you'd like to see more of in this community`,
  `📲 I'm always active – drop me a comment and I'll reply fast`
];

// ─── Trending Topic Templates ──────────────────────────────────
const trendingTemplates = [
  (topic) => `📊 ${topic.headline}. ${topic.detail} ${random(CTAS)} #LouisvilleRealEstate`,
  (topic) => `🔍 Market update: ${topic.headline}. ${topic.detail} ${random(CTAS)} #KYHomes`,
  (topic) => `📈 Did you catch this? ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `🏙️ Louisville market news: ${topic.headline}. ${topic.detail} ${random(CTAS)}`,
  (topic) => `💡 ${topic.headline}. ${topic.detail} ${random(CTAS)} #Louisville`
];

// ─── Listing Templates ─────────────────────────────────────────
const listingTemplates = [
  (listing) => {
    let msg = `🏡 New listing alert! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 80)}...`;
    msg += formatListingUrl(listing);
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    let msg = `Just hit the market: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 60)}...`;
    msg += formatListingUrl(listing);
    msg += ` ${random(CTAS)} #KYHomes`;
    return msg;
  },
  (listing) => {
    let msg = `🚀 Hot property! ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}. Priced at $${listing.price.toLocaleString()}.`;
    msg += formatListingUrl(listing);
    msg += ` ${random(CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} – only $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 70)}...`;
    msg += formatListingUrl(listing);
    msg += ` ${random(CTAS)}`;
    return msg;
  },
  (listing) => {
    let msg = `✨ Just listed: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA with ${listing.sqft || '?'} sqft. $${listing.price.toLocaleString()} – `;
    msg += formatListingUrl(listing);
    msg += ` ${random(CTAS)}`;
    return msg;
  }
];

// ─── Stat Templates ───────────────────────────────────────────
const statTemplates = [
  (stat) => `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${random(CTAS)} #KYMarket`,
  (stat) => `💰 Market update: ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(CTAS)}`,
  (stat) => `📈 ${stat.metric}: ${stat.value}. ${random(CTAS)} #LouisvilleRealEstate`,
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

// ─── Media Templates (NEW) ──────────────────────────────────────
const mediaTemplates = [
  (media) => `🎬 Check out this ${media.type}: ${media.title}. ${media.description ? media.description.slice(0, 80) + '...' : ''} Watch it here: ${media.url} ${random(CTAS)} #Media`,
  (media) => `📺 I just shared a ${media.type}: ${media.title}. ${media.description ? media.description.slice(0, 60) : ''} ${random(CTAS)}`,
  (media) => `✨ ${media.type === 'video' ? 'Video' : 'Image'} alert: ${media.title}. ${media.description ? media.description.slice(0, 70) + '...' : ''} ${random(CTAS)}`,
  (media) => `📹 ${media.title}. ${media.description ? media.description.slice(0, 80) : ''} ${random(CTAS)} #KYRealEstate`,
  (media) => `📽️ ${media.type === 'video' ? 'New video' : 'New image'}: ${media.title}. ${media.description ? media.description.slice(0, 60) : ''} ${random(CTAS)}`
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

  // 25% chance to post a trending topic (now from database)
  if (Math.random() < 0.25) {
    const topics = await getTrendingTopicsFromDB();
    if (topics.length > 0) {
      const topic = random(topics);
      const template = random(trendingTemplates);
      postContent = template(topic);
      dataType = 'trending';
    }
  }

  // If not trending, pick data based on niche
  if (!postContent) {
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
      case 'Media': // <-- NEW
        dataItem = await getRandomItem(MediaItem, { active: true });
        if (dataItem) { templateSet = mediaTemplates; type = 'media'; }
        break;
      default:
        const rand = Math.random();
        if (rand < 0.25) {
          dataItem = await getRandomItem(Listing);
          if (dataItem) { templateSet = listingTemplates; type = 'listing'; }
        } else if (rand < 0.50) {
          dataItem = await getRandomItem(MarketStat);
          if (dataItem) { templateSet = statTemplates; type = 'stat'; }
        } else if (rand < 0.75) {
          dataItem = await getRandomItem(NewsItem);
          if (dataItem) { templateSet = newsTemplates; type = 'news'; }
        } else {
          dataItem = await getRandomItem(MediaItem, { active: true });
          if (dataItem) { templateSet = mediaTemplates; type = 'media'; }
        }
        break;
    }

    if (dataItem && templateSet) {
      const template = random(templateSet);
      postContent = template(dataItem);
      dataType = type;
      
      // If it's a media item, set video or image
      if (type === 'media' && dataItem.url) {
        if (dataItem.type === 'video' || dataItem.url.includes('youtube') || dataItem.url.includes('youtu.be')) {
          video = dataItem.url;
        } else {
          image = dataItem.url;
        }
      }
      if (dataItem.images && dataItem.images.length > 0) {
        image = dataItem.images[0];
      }
    }
  }

  // If no content, fallback to a generic post
  if (!postContent) {
    const topics = await getTrendingTopicsFromDB();
    if (topics.length > 0) {
      const topic = random(topics);
      const template = random(trendingTemplates);
      postContent = template(topic);
      dataType = 'trending-fallback';
    } else {
      postContent = `👋 ${botUser.name} here! Follow me for the latest Louisville real estate insights. ${random(CTAS)} #ScrollCity`;
      dataType = 'fallback';
    }
  }

  // ─── Fetch a Pexels image (35% chance, only if no image/video) ──
  if (!image && !video && Math.random() < 0.35) {
    let query = 'louisville';
    if (dataType === 'listing') query = 'house';
    else if (dataType === 'stat') query = 'city';
    else if (dataType === 'news') query = 'city';
    else if (dataType === 'event') query = 'people';
    else if (dataType === 'trending' || dataType === 'trending-fallback') query = 'louisville skyline';
    else if (dataType === 'media') query = 'media';
    
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