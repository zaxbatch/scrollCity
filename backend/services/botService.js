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

// ─── Helper: weighted random selection ────────────────────────
const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item.value;
  }
  return items[0].value;
};

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
const BLOG_URL = 'https://zerric.com/blog';
const CONTACT_URL = 'https://zerric.com/contact';

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

// ─── Advanced CTAs (categorized, no periods after URLs) ──────
const CTAS_CATEGORIES = {
  website: [
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
    `📖 Read more insights on Zerric's blog: ${BLOG_URL}`,
    `✉️ Have a specific question? Contact Zerric directly: ${CONTACT_URL}`
  ],
  referral: [
    `💬 Have questions about today's market? Zerric has the answers – just reach out`,
    `📞 Zerric is available to chat about your real estate goals – contact him anytime`,
    `🤔 Wondering what this means for you? Zerric can explain in plain language`,
    `🏘️ Looking for the perfect neighborhood? Zerric knows Louisville inside out`,
    `📊 Want more insights like this? Zerric would love to connect with you`,
    `⭐ Zerric is here to help you navigate the Louisville market with confidence`,
    `📲 Zerric offers free, no‑pressure consultations – reach out to learn more`,
    `🏠 I know a Realtor who can help – and it's Zerric 😉`,
    `🗣️ Zerric speaks real estate – and he speaks Louisville`,
    `🤝 Zerric treats every client like family – reach out to him`,
    `💎 Zerric's knowledge of Louisville is unmatched – just ask him`,
    `🎯 Looking for honest advice? Zerric is your guy`
  ],
  engagement: [
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
    `📲 I'm always active – drop me a comment and I'll reply fast`,
    `💭 Your thoughts matter – what's on your mind about the market?`
  ],
  questions: [
    `❓ Are you ready to make a move in Louisville? Zerric can help`,
    `🤔 Wondering if now is the time to buy? Zerric has insights`,
    `💭 Thinking about selling? Let's talk strategy – Zerric knows the market`,
    `❓ What's your home worth in today's market? Zerric can tell you`,
    `💡 Looking for investment opportunities? Zerric knows where to look`,
    `❓ First-time homebuyer? Zerric makes the process easy`,
    `🧐 Curious about new developments in Louisville? Zerric stays informed`,
    `❓ Ready to upgrade? Let's find your next home together`,
    `💭 Considering downsizing? Zerric can guide you through it`,
    `❓ Wondering about market trends? Zerric tracks them daily`
  ]
};

// Combine all CTAs for fallback
const ALL_CTAS = Object.values(CTAS_CATEGORIES).flat();

// ─── Niche‑specific CTA preference ─────────────────────────────
const NICHE_CTAS = {
  'Finance': [...CTAS_CATEGORIES.website, ...CTAS_CATEGORIES.referral, ...CTAS_CATEGORIES.questions],
  'Market Data': [...CTAS_CATEGORIES.website, ...CTAS_CATEGORIES.referral, ...CTAS_CATEGORIES.engagement],
  'Construction': [...CTAS_CATEGORIES.website, ...CTAS_CATEGORIES.referral, ...CTAS_CATEGORIES.engagement],
  'Neighborhood': [...CTAS_CATEGORIES.engagement, ...CTAS_CATEGORIES.referral, ...CTAS_CATEGORIES.questions],
  'Investment': [...CTAS_CATEGORIES.website, ...CTAS_CATEGORIES.referral, ...CTAS_CATEGORIES.questions],
  'Media': [...CTAS_CATEGORIES.website, ...CTAS_CATEGORIES.engagement, ...CTAS_CATEGORIES.questions],
  'General': ALL_CTAS
};

// ─── Enhanced Trending Topic Templates ──────────────────────────
const trendingTemplates = [
  (topic) => {
    const openings = [`📊 Market update:`, `🔍 Breaking news:`, `📈 Important shift:`, `🏙️ Louisville alert:`, `💡 Did you catch this?`];
    return `${random(openings)} ${topic.headline}. ${topic.detail} ${random(ALL_CTAS)} #LouisvilleRealEstate`;
  },
  (topic) => {
    const intros = [`Here's what's happening:`, `Let me share key data:`, `Every buyer should know:`, `Important for homeowners:`, `The market is shifting:`];
    return `${random(intros)} ${topic.headline}. ${topic.detail} ${random(ALL_CTAS)} #KYHomes`;
  },
  (topic) => {
    const personal = [`As your local Realtor:`, `Speaking from experience:`, `I've been watching this:`, `From my perspective:`, `Here's what I'm seeing:`];
    return `${random(personal)} ${topic.headline}. ${topic.detail} ${random(ALL_CTAS)} #LouisvilleLiving`;
  },
  (topic) => {
    const questions = [`What does this mean for you?`, `How does this affect your home?`, `Is this good for buyers or sellers?`, `Thinking about moving?`, `Curious about your home's value?`];
    return `${random(questions)} ${topic.headline}. ${topic.detail} ${random(ALL_CTAS)} #LouisvilleMarket`;
  },
  (topic) => {
    const calls = [`Let's break this down:`, `Want to understand this?`, `Ready to make a smart move?`, `Need expert guidance?`, `Let me help you navigate:`];
    return `${random(calls)} ${topic.headline}. ${topic.detail} ${random(ALL_CTAS)} #ZerricRealty`;
  }
];

// ─── Enhanced Listing Templates ─────────────────────────────────
const listingTemplates = [
  (listing) => {
    const intros = [`🏡 Exciting new listing alert!`, `🔑 Just hit the market!`, `✨ Beautiful new listing!`, `🎯 Check out this gem!`, `🌟 Fresh listing in Louisville!`];
    let msg = `${random(intros)} ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 100);
      msg += ` – ${desc}${desc.length >= 100 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    const features = [`with a spacious layout`, `with amazing natural light`, `with updated kitchen and baths`, `with a beautiful backyard`, `with fantastic curb appeal`];
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} ${random(features)} – $${listing.price.toLocaleString()}`;
    if (listing.sqft) msg += `, ${listing.sqft} sqft`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #KYHomes`;
    return msg;
  },
  (listing) => {
    const highlights = [`This one has it all –`, `You won't want to miss –`, `This property is a must-see –`, `This home is move-in ready –`, `Check out these features –`];
    let msg = `🚀 Hot property! ${random(highlights)} ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}`;
    if (listing.sqft) msg += `, ${listing.sqft} sqft`;
    msg += ` at $${listing.price.toLocaleString()}`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  (listing) => {
    const priceComments = [`at an incredible price`, `with great value`, `priced to sell`, `at a fantastic price point`, `with excellent investment potential`];
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} ${random(priceComments)} $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 80);
      msg += ` – ${desc}${desc.length >= 80 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  },
  (listing) => {
    const dreamTerms = [`Your dream home awaits`, `The perfect family home`, `A true Louisville treasure`, `An absolute charmer`, `A stunning property`];
    let msg = `✨ ${random(dreamTerms)} – ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA`;
    if (listing.sqft) msg += ` with ${listing.sqft} sqft`;
    msg += ` for $${listing.price.toLocaleString()}`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleLiving`;
    return msg;
  },
  (listing) => {
    const neighborhoodIntros = [`Located in desirable`, `Situated in the heart of`, `Beautiful home in`, `Prime location in`, `This home is in`];
    const area = listing.neighborhood || listing.city || 'Louisville';
    let msg = `${random(neighborhoodIntros)} ${area} – ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 70);
      msg += ` – ${desc}${desc.length >= 70 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  }
];

// ─── Enhanced Stat Templates ────────────────────────────────────
const statTemplates = [
  (stat) => {
    const intros = [`📊 Here's what the numbers say:`, `📈 Let's look at the data:`, `💡 Key market indicator:`, `🔍 Important stat to know:`, `📉 Market analysis:`];
    return `${random(intros)} ${stat.metric} in ${stat.region} is ${stat.value}. ${random(ALL_CTAS)} #KYMarket`;
  },
  (stat) => {
    const insights = [`As someone who watches the market daily:`, `From my experience in Louisville:`, `I've been tracking this trend:`, `Here's what this means for buyers/sellers:`, `This is significant for our market:`];
    return `${random(insights)} ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(ALL_CTAS)}`;
  },
  (stat) => {
    const questions = [`What does this mean for you?`, `Is this good news?`, `How does this affect your buying power?`, `Thinking about selling? Consider:`, `Wondering about market timing? Check:`];
    return `${random(questions)} ${stat.metric}: ${stat.value} in ${stat.region}. ${random(ALL_CTAS)} #LouisvilleRealEstate`;
  },
  (stat) => {
    const actions = [`Smart buyers are paying attention to:`, `Here's why you should care:`, `This data is crucial for your decision:`, `Want to make informed decisions? Consider:`, `Here's what successful investors watch:`];
    return `${random(actions)} ${stat.metric} in ${stat.region} is ${stat.value}. ${random(ALL_CTAS)}`;
  },
  (stat) => {
    const trends = [`The trend is clear:`, `We're seeing a pattern:`, `The market is showing:`, `Consistent data shows:`, `The numbers tell us:`];
    return `${random(trends)} ${stat.metric} sits at ${stat.value} in ${stat.region}. ${random(ALL_CTAS)} #ZerricInsights`;
  }
];

// ─── Enhanced News Templates ────────────────────────────────────
const newsTemplates = [
  (news) => {
    const intros = [`📰 Breaking news for Louisville:`, `🔔 Important development:`, `📢 Big news in real estate:`, `🏙️ Major announcement:`, `💥 Just in:`];
    return `${random(intros)} ${news.headline} – ${news.summary.slice(0, 120)}... ${random(ALL_CTAS)} #KYNews`;
  },
  (news) => {
    const impacts = [`Here's how this affects you:`, `This matters for homeowners:`, `This changes things:`, `What this means for the market:`, `You need to know this:`];
    return `${random(impacts)} ${news.headline}. ${news.summary.slice(0, 100)}... ${random(ALL_CTAS)} #Louisville`;
  },
  (news) => {
    const analyses = [`Let me break this down:`, `Here's my take:`, `What this really means:`, `As a Realtor, here's my interpretation:`, `The real story behind the headline:`];
    return `${random(analyses)} ${news.headline} – ${news.summary.slice(0, 110)}... ${random(ALL_CTAS)} #KYMarket`;
  },
  (news) => {
    const punches = [`🗞️ Big news:`, `⚠️ Important update:`, `💡 Key development:`, `📣 Must-read:`, `✨ Major update:`];
    return `${random(punches)} ${news.headline}. ${news.summary.slice(0, 90)}... ${random(ALL_CTAS)} #LouisvilleLiving`;
  },
  (news) => {
    const opportunities = [`Here's an opportunity:`, `This creates opportunity:`, `Smart investors are watching:`, `This news opens doors:`, `Check out this development:`];
    return `${random(opportunities)} ${news.headline} – ${news.summary.slice(0, 100)}... ${random(ALL_CTAS)} #ZerricRealty`;
  }
];

// ─── Enhanced Event Templates ──────────────────────────────────
const eventTemplates = [
  (event) => {
    const socials = [`📅 Mark your calendar!`, `🗓️ Don't miss this event!`, `📌 Save the date:`, `🎉 Exciting event coming up:`, `🤝 Join us for:`];
    let msg = `${random(socials)} ${event.title} – ${event.description?.slice(0, 80)}...`;
    if (event.location) msg += ` at ${event.location}`;
    if (event.date) {
      const date = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      msg += ` on ${date}`;
    }
    msg += ` ${random(ALL_CTAS)} #LouisvilleEvents`;
    return msg;
  },
  (event) => {
    const communityStarts = [`🏘️ Great community event:`, `👥 Come together for:`, `🤗 The community is invited to:`, `💪 Local event alert:`, `🌟 Community gathering:`];
    let msg = `${random(communityStarts)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 70)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #LouisvilleCommunity`;
    return msg;
  },
  (event) => {
    const professionalStarts = [`📊 Professional development:`, `💼 Industry event:`, `📈 Network and learn:`, `🎓 Educational event:`, `🤝 Business networking:`];
    let msg = `${random(professionalStarts)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 80)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #KYBusiness`;
    return msg;
  },
  (event) => {
    const announcements = [`📢 Just announced:`, `🗣️ Happening soon:`, `📋 New event:`, `✨ Coming up:`, `🎯 Don't forget:`];
    let msg = `${random(announcements)} ${event.title}`;
    if (event.description) {
      const desc = event.description.slice(0, 60);
      msg += ` – ${desc}${desc.length >= 60 ? '...' : ''}`;
    }
    if (event.location) msg += ` in ${event.location}`;
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  },
  (event) => {
    const invitations = [`🎟️ Who's coming?`, `👋 Will I see you there?`, `🤝 Let's connect:`, `🌟 Be there:`, `💬 Let's discuss:`];
    let msg = `${random(invitations)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 70)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #ZerricEvents`;
    return msg;
  }
];

// ─── Enhanced Media Templates ──────────────────────────────────
const mediaTemplates = [
  (media) => {
    const intros = [`🎬 Check out this ${media.type}:`, `📺 I just shared a ${media.type}:`, `🎥 New ${media.type} alert:`, `📹 ${media.type === 'video' ? 'Video' : 'Image'}:`, `📽️ ${media.type === 'video' ? 'New video' : 'New image'}:`];
    let msg = `${random(intros)} ${media.title}`;
    if (media.description) msg += ` – ${media.description.slice(0, 80)}...`;
    if (media.url) msg += ` Watch it here: ${media.url}`;
    msg += ` ${random(ALL_CTAS)} #Media`;
    return msg;
  },
  (media) => {
    const questions = [`What do you think of this?`, `Is this helpful?`, `Would you like more content like this?`, `What's your take?`, `Let me know in the comments`];
    let msg = `📺 ${media.title}`;
    if (media.description) msg += ` – ${media.description.slice(0, 60)}`;
    if (media.url) msg += ` ${media.url}`;
    msg += ` ${random(questions)} ${random(ALL_CTAS)} #KYRealEstate`;
    return msg;
  },
  (media) => {
    const calls = [`Check it out:`, `You don't want to miss this:`, `Take a look:`, `Watch this:`, `See for yourself:`];
    let msg = `${random(calls)} ${media.title}`;
    if (media.description) msg += ` – ${media.description.slice(0, 70)}...`;
    if (media.url) msg += ` (${media.url})`;
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  },
  (media) => {
    const highlights = [`Featured content:`, `Staff pick:`, `Must-see:`, `Trending now:`, `Popular:`];
    let msg = `✨ ${random(highlights)} ${media.title}`;
    if (media.description) msg += `: ${media.description.slice(0, 80)}...`;
    if (media.url) msg += ` ${media.url}`;
    msg += ` ${random(ALL_CTAS)} #ZerricMedia`;
    return msg;
  },
  (media) => {
    const personal = [`I'm excited to share this`, `Check out what I found`, `I thought you'd enjoy this`, `This caught my eye`, `I want to show you something`];
    let msg = `${random(personal)} – ${media.title}`;
    if (media.description) msg += ` (${media.description.slice(0, 60)}...)`;
    if (media.url) msg += ` ${media.url}`;
    msg += ` ${random(ALL_CTAS)} #LouisvilleLife`;
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

// ─── Get niche-appropriate CTAs ──────────────────────────────
function getCTAsForNiche(niche) {
  return NICHE_CTAS[niche] || ALL_CTAS;
}

// ─── Main bot posting function ───────────────────────────────
async function postFromBot(botUsername) {
  const botUser = await User.findOne({ username: botUsername, isBot: true });
  if (!botUser) throw new Error('Bot not found');

  const niche = botUser.botNiche || 'General';
  const nicheCTAs = getCTAsForNiche(niche);
  
  let postContent = '';
  let image = '';
  let video = '';
  let dataType = '';

  // ─── Weighted content type selection ────────────────────────
  const contentTypes = [
    { value: 'trending', weight: 25 },
    { value: 'listing', weight: 20 },
    { value: 'stat', weight: 20 },
    { value: 'news', weight: 15 },
    { value: 'event', weight: 10 },
    { value: 'media', weight: 7 },
    { value: 'general', weight: 3 }
  ];
  const contentType = weightedRandom(contentTypes);

  let dataItem = null;
  let templateSet = null;
  let type = '';

  // ─── Generate content based on type ─────────────────────────
  switch (contentType) {
    case 'trending': {
      const topics = await getTrendingTopicsFromDB();
      if (topics.length > 0) {
        const topic = random(topics);
        const template = random(trendingTemplates);
        postContent = template(topic);
        dataType = 'trending';
        break;
      }
      // fall through if no topics
    }
    case 'listing': {
      const filter = niche === 'Investment' ? { propertyType: 'Multi-Family' } : {};
      dataItem = await getRandomItem(Listing, filter);
      if (dataItem) { templateSet = listingTemplates; type = 'listing'; }
      break;
    }
    case 'stat': {
      const filter = niche === 'Finance' ? { category: 'Economic' } :
                     niche === 'Market Data' ? { category: 'Price' } : {};
      dataItem = await getRandomItem(MarketStat, filter);
      if (dataItem) { templateSet = statTemplates; type = 'stat'; }
      break;
    }
    case 'news': {
      const filter = niche === 'Construction' ? { category: 'Development' } : {};
      dataItem = await getRandomItem(NewsItem, filter);
      if (dataItem) { templateSet = newsTemplates; type = 'news'; }
      break;
    }
    case 'event': {
      const filter = niche === 'Neighborhood' ? { type: 'Community Meeting' } : {};
      dataItem = await getRandomItem(Event, filter);
      if (dataItem) { templateSet = eventTemplates; type = 'event'; }
      break;
    }
    case 'media': {
      dataItem = await getRandomItem(MediaItem, { active: true });
      if (dataItem) { templateSet = mediaTemplates; type = 'media'; }
      break;
    }
    case 'general':
    default: {
      // Generic posts with personality
      const genericTemplates = [
        `👋 ${botUser.name} here! I'm passionate about helping you find your dream home in Louisville ${random(ALL_CTAS)} #ZerricRealty`,
        `🏡 Louisville real estate is my specialty – let me help you navigate the market ${random(ALL_CTAS)} #LouisvilleLiving`,
        `💭 Thinking about buying or selling? I'd love to chat about your goals ${random(ALL_CTAS)} #KYHomes`,
        `✨ Every home has a story – let me help you write yours ${random(ALL_CTAS)} #LouisvilleRealEstate`,
        `📈 Whether you're a first-time buyer or experienced investor, I'm here to help ${random(ALL_CTAS)} #ZerricInsights`
      ];
      postContent = random(genericTemplates);
      dataType = 'general';
      break;
    }
  }

  // ─── Process data item if found ─────────────────────────────
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

  // ─── Ensure a CTA is included if missing ────────────────────
  if (!postContent.includes('zerric.com') && !postContent.includes('Zerric')) {
    postContent += ` ${random(nicheCTAs)}`;
  }

  // ─── Fallback if still no content ────────────────────────────
  if (!postContent) {
    const fallbacks = [
      `👋 ${botUser.name} here! Follow me for the latest Louisville real estate insights ${random(ALL_CTAS)} #ScrollCity`,
      `🏡 Louisville real estate is always changing – let's stay connected ${random(ALL_CTAS)} #KYHomes`,
      `📊 I track the Louisville market so you don't have to – follow for updates ${random(ALL_CTAS)} #LouisvilleLiving`
    ];
    postContent = random(fallbacks);
    dataType = 'fallback';
  }

  // ─── Fetch a Pexels image (45% chance, only if no image/video) ──
  if (!image && !video && Math.random() < 0.45) {
    const queryMap = {
      'listing': random(['house', 'home', 'property', 'real estate', 'modern house']),
      'stat': random(['city', 'urban', 'downtown', 'cityscape', 'skyline']),
      'news': random(['city', 'skyline', 'buildings', 'construction']),
      'event': random(['people', 'crowd', 'meeting', 'community', 'gathering']),
      'trending': random(['louisville skyline', 'downtown louisville', 'louisville', 'kentucky']),
      'media': random(['media', 'video', 'image', 'technology', 'screen']),
      'fallback': random(['louisville', 'house', 'city', 'real estate'])
    };
    const query = queryMap[dataType] || 'louisville';
    const pexelsImage = await fetchPexelsImage(query);
    if (pexelsImage) {
      image = pexelsImage;
    }
  }

  // ─── Create the post ──────────────────────────────────────────
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

  // ─── Update lastPostAt ────────────────────────────────────────
  await BotPersona.findOneAndUpdate(
    { username: botUsername },
    { 
      lastPostAt: new Date(),
      $inc: { postCount: 1 }
    },
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