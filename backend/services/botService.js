const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');

// ─── Templates ──────────────────────────────────────────
const listingTemplate = (listing) => {
  return `🏡 Just listed: ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}. ${listing.description?.slice(0, 80)}... <a href="#">View details</a> #LouisvilleRealEstate`;
};

const statTemplate = (stat) => {
  return `📊 ${stat.metric} in ${stat.region}: ${stat.value}. ${stat.source} ${stat.date ? 'as of ' + new Date(stat.date).toLocaleDateString() : ''} <a href="#">#KYMarket</a>`;
};

const newsTemplate = (news) => {
  return `📰 ${news.headline}: ${news.summary.slice(0, 100)}... ${news.link ? `<a href="${news.link}">Read more</a>` : ''} #KYNews`;
};

const eventTemplate = (event) => {
  return `📅 ${event.title} – ${event.description?.slice(0, 60)}... ${event.startDate ? 'Starts ' + new Date(event.startDate).toLocaleDateString() : ''} <a href="#">#Event</a>`;
};

// ─── Pick a random item from a collection ──────────────
async function getRandomItem(model, filter = {}) {
  const count = await model.countDocuments(filter);
  if (count === 0) return null;
  const random = Math.floor(Math.random() * count);
  return await model.findOne(filter).skip(random);
}

// ─── Main bot posting function ─────────────────────────
async function postFromBot(botUsername) {
  const botUser = await User.findOne({ username: botUsername, isBot: true });
  if (!botUser) throw new Error('Bot not found');

  // Determine niche
  const niche = botUser.botNiche || 'General';

  let postContent = '';
  let image = '';
  let video = '';

  // Pick data based on niche
  switch (niche) {
    case 'Finance':
      const stat = await getRandomItem(MarketStat, { category: 'Economic' });
      if (stat) {
        postContent = statTemplate(stat);
      }
      break;
    case 'Market Data':
      const stat2 = await getRandomItem(MarketStat, { category: 'Price' });
      if (stat2) {
        postContent = statTemplate(stat2);
      }
      break;
    case 'Construction':
      const newsItem = await getRandomItem(NewsItem, { category: 'Development' });
      if (newsItem) {
        postContent = newsTemplate(newsItem);
      }
      break;
    case 'Neighborhood':
      const event = await getRandomItem(Event, { type: 'Community Meeting' });
      if (event) {
        postContent = eventTemplate(event);
      }
      break;
    case 'Investment':
      const listing = await getRandomItem(Listing, { propertyType: 'Multi-Family' });
      if (listing) {
        postContent = listingTemplate(listing);
        image = listing.images?.[0] || '';
      }
      break;
    default: // General
      const randomChoice = Math.random();
      if (randomChoice < 0.4) {
        const l = await getRandomItem(Listing);
        if (l) {
          postContent = listingTemplate(l);
          image = l.images?.[0] || '';
        }
      } else if (randomChoice < 0.7) {
        const s = await getRandomItem(MarketStat);
        if (s) postContent = statTemplate(s);
      } else {
        const n = await getRandomItem(NewsItem);
        if (n) postContent = newsTemplate(n);
      }
      break;
  }

  // If no content found, fallback to a generic post
  if (!postContent) {
    postContent = `📢 ${botUser.name} is here! Follow for the latest Kentucky real estate insights. #ScrollCity`;
  }

  // Create post
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

  // Update lastPostAt for the bot persona
  await BotPersona.findOneAndUpdate(
    { username: botUsername },
    { lastPostAt: new Date() },
    { upsert: true }
  );

  return post;
}

// ─── Scheduler ──────────────────────────────────────────
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

// ─── Start scheduler ──────────────────────────────────
function startBotService() {
  // Run every minute
  setInterval(runBotScheduler, 60000);
  // Also run immediately
  setTimeout(runBotScheduler, 5000);
}

module.exports = { startBotService, postFromBot };