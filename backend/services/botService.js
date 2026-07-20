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

// ─── Helper: weighted random selection ────────────────────────
const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.value;
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

// ─── Advanced CTAs with varied tones ─────────────────────────
const CTAS = {
  // Website plugs (no period after URL)
  website: [
    `🏠 Have questions about buying or selling? Visit me at ${MAIN_URL}`,
    `📞 Ready to make a move? Zerric can help – start at ${MAIN_URL}`,
    `📧 Get a free home valuation from Zerric at ${MAIN_URL}`,
    `🔍 See a home you love? Reach out to Zerric via ${MAIN_URL}`,
    `📈 Not sure if now is the right time? Let's chat – ${MAIN_URL}`,
    `🏡 Your dream home is waiting – Zerric can help you find it at ${MAIN_URL}`,
    `📱 Thinking of selling? Zerric gets top dollar – ${MAIN_URL}`,
    `📐 Calculate your payments with Zerric's mortgage calculator: ${MORTGAGE_URL}`,
    `📝 Share your story on Zerric's guest book: ${GUESTBOOK_URL}`,
    `🔎 Search properties like a pro with Zerric's tool: ${SEARCH_URL}`,
    `💬 Live chat with Zerric – just click the icon at ${MAIN_URL}`,
    `🤝 Looking for a trusted Realtor? Zerric is at ${MAIN_URL}`,
    `📲 Chat with Zerric directly via his website: ${MAIN_URL}`,
    `🏘️ Explore all listings and resources at ${MAIN_URL}`,
    `📞 Zerric is a call or click away – ${MAIN_URL}`,
    `📖 Read insights on Zerric's blog: ${BLOG_URL}`,
    `✉️ Have a specific question? Contact Zerric directly: ${CONTACT_URL}`
  ],
  
  // Referral to Zerric (no link)
  referral: [
    `💬 Have questions? Zerric has answers – just reach out`,
    `📞 Zerric is available to chat about your real estate goals`,
    `🤔 Wondering what this means for you? Zerric can explain`,
    `🏘️ Looking for the perfect neighborhood? Zerric knows Louisville`,
    `📊 Want more insights? Zerric would love to connect`,
    `⭐ Zerric helps navigate the Louisville market with confidence`,
    `📲 Free, no-pressure consultations with Zerric – reach out`,
    `🏠 I know a Realtor who can help – it's Zerric 😉`,
    `🗣️ Zerric speaks real estate – and he speaks Louisville`,
    `🤝 Zerric treats every client like family – reach out to him`,
    `💎 Zerric's knowledge of Louisville is unmatched – just ask him`,
    `🎯 Looking for honest advice? Zerric is your guy`,
    `🌟 Zerric has helped hundreds of families find their dream home`,
    `📈 Zerric stays ahead of market trends – he can help you too`
  ],
  
  // Engagement prompts
  engagement: [
    `💬 What do you think? Drop a comment below – I'd love to hear`,
    `🗣️ Follow for more local insights and updates`,
    `📢 Your feedback helps me serve you better – let me know`,
    `⭐ Found this useful? Share it with a friend`,
    `📲 Have a question? I'm just a message away`,
    `👍 Like this post? Hit that like button`,
    `🌟 Thinking of making a move? I'm here to guide you`,
    `📊 Want more data? Follow for regular market snapshots`,
    `💬 What's your biggest real estate question? Let's discuss`,
    `📢 What neighborhood should I cover next?`,
    `👋 Thanks for being part of this community – your support means a lot`,
    `✨ Curious about your home's value? I can help you find out`,
    `📲 Have you signed my guest book yet? I'd love to hear your story`,
    `🌟 Your real estate journey matters to me – let's make it smooth`,
    `💬 What's your favorite Louisville neighborhood? Tell me in the comments`,
    `📢 Tag someone who needs to see this`,
    `🔔 Follow to stay up‑to‑date on Kentucky real estate`,
    `🏘️ I'm passionate about helping families find their perfect home`,
    `💬 I'm just a click away – let's talk about your goals`,
    `🎯 What would you like to see more of in this community?`,
    `📲 I'm always active – drop a comment and I'll reply fast`,
    `💭 Your thoughts matter – what's on your mind about the market?`,
    `📱 I'd love to connect with you – what's your biggest real estate challenge?`
  ],
  
  // Question-based CTAs
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

// ─── All CTAs combined ────────────────────────────────────────
const ALL_CTAS = [
  ...CTAS.website,
  ...CTAS.referral,
  ...CTAS.engagement,
  ...CTAS.questions
];

// ─── Niche-specific CTA preferences ────────────────────────────
const NICHE_CTAS = {
  'Finance': [...CTAS.website, ...CTAS.referral, ...CTAS.questions],
  'Market Data': [...CTAS.website, ...CTAS.referral, ...CTAS.engagement],
  'Construction': [...CTAS.website, ...CTAS.referral, ...CTAS.engagement],
  'Neighborhood': [...CTAS.engagement, ...CTAS.referral, ...CTAS.questions],
  'Investment': [...CTAS.website, ...CTAS.referral, ...CTAS.questions],
  'General': ALL_CTAS
};

// ─── Advanced Trending Topic Templates ──────────────────────────
const trendingTemplates = [
  // Template 1: Market update style
  (topic) => {
    const openings = [
      `📊 Market update from Zerric:`,
      `🔍 Breaking real estate news:`,
      `📈 Important market shift:`,
      `🏙️ Louisville real estate alert:`,
      `💡 Did you catch this?`
    ];
    return `${random(openings)} ${topic.headline} ${topic.detail} ${random(ALL_CTAS)} #LouisvilleRealEstate`;
  },
  // Template 2: Story-driven
  (topic) => {
    const intros = [
      `Here's what's happening in Louisville:`,
      `Let me share some key market data:`,
      `Here's something every Louisville homebuyer should know:`,
      `Important news for Louisville homeowners:`,
      `The market is shifting – here's the latest:`
    ];
    return `${random(intros)} ${topic.headline} ${topic.detail} ${random(ALL_CTAS)} #KYHomes`;
  },
  // Template 3: Personal perspective
  (topic) => {
    const personalStarts = [
      `As your local Realtor, I want you to know:`,
      `Speaking from experience in Louisville:`,
      `I've been watching this trend closely:`,
      `From my perspective as a Louisville Realtor:`,
      `Here's what I'm seeing in our market:`
    ];
    return `${random(personalStarts)} ${topic.headline} ${topic.detail} ${random(ALL_CTAS)} #LouisvilleLiving`;
  },
  // Template 4: Question-based
  (topic) => {
    const questions = [
      `What does this mean for you?`,
      `Are you wondering how this affects your home?`,
      `Is this good news for buyers or sellers?`,
      `Thinking about making a move? Here's what you should know:`,
      `Curious about your home's value in this market?`
    ];
    return `${random(questions)} ${topic.headline} ${topic.detail} ${random(ALL_CTAS)} #LouisvilleMarket`;
  },
  // Template 5: Call to action focused
  (topic) => {
    const calls = [
      `Let's break this down:`,
      `Want to understand what this means for you?`,
      `Ready to make a smart move? Here's what's happening:`,
      `Need expert guidance? Check this out:`,
      `Let me help you navigate this market:`
    ];
    return `${random(calls)} ${topic.headline} ${topic.detail} ${random(ALL_CTAS)} #ZerricRealty`;
  }
];

// ─── Advanced Listing Templates ────────────────────────────────
const listingTemplates = [
  // Template 1: Exciting new listing
  (listing) => {
    const intros = [
      `🏡 Exciting new listing alert!`,
      `🔑 Just hit the market!`,
      `✨ Beautiful new listing!`,
      `🎯 Check out this gem!`,
      `🌟 Fresh listing in Louisville!`
    ];
    let msg = `${random(intros)} ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA at ${listing.address} for $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 100);
      msg += ` – ${desc}${desc.length >= 100 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  // Template 2: Feature-focused
  (listing) => {
    const features = [
      `with a spacious layout`,
      `with amazing natural light`,
      `with updated kitchen and bathrooms`,
      `with a beautiful backyard`,
      `with fantastic curb appeal`
    ];
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA in ${listing.city || 'Louisville'} `;
    msg += random(features);
    msg += ` – $${listing.price.toLocaleString()}`;
    if (listing.sqft) msg += `, ${listing.sqft} sqft`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #KYHomes`;
    return msg;
  },
  // Template 3: Highlight best features
  (listing) => {
    const highlights = [
      `This one has it all –`,
      `You won't want to miss this –`,
      `This property is a must-see –`,
      `This home is move-in ready –`,
      `Check out these features –`
    ];
    let msg = `🚀 Hot property! ${random(highlights)} ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA on ${listing.address}`;
    if (listing.sqft) msg += `, ${listing.sqft} sqft`;
    msg += ` at $${listing.price.toLocaleString()}`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleRealEstate`;
    return msg;
  },
  // Template 4: Price-focused
  (listing) => {
    const priceComments = [
      `at an incredible price`,
      `with great value`,
      `priced to sell`,
      `at a fantastic price point`,
      `with excellent investment potential`
    ];
    let msg = `🏠 ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA home in ${listing.city || 'Louisville'} `;
    msg += random(priceComments);
    msg += ` $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 80);
      msg += ` – ${desc}${desc.length >= 80 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  },
  // Template 5: Dream home style
  (listing) => {
    const dreamTerms = [
      `Your dream home awaits`,
      `The perfect family home`,
      `A true Louisville treasure`,
      `An absolute charmer`,
      `A stunning property`
    ];
    let msg = `✨ ${random(dreamTerms)} – ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA `;
    if (listing.sqft) msg += `with ${listing.sqft} sqft `;
    msg += `for $${listing.price.toLocaleString()}`;
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)} #LouisvilleLiving`;
    return msg;
  },
  // Template 6: Neighborhood-focused
  (listing) => {
    const neighborhoodIntros = [
      `Located in desirable`,
      `Situated in the heart of`,
      `Beautiful home in`,
      `Prime location in`,
      `This home is in`
    ];
    const area = listing.neighborhood || listing.city || 'Louisville';
    let msg = `${random(neighborhoodIntros)} ${area} – ${listing.bedrooms || '?'}BR/${listing.bathrooms || '?'}BA`;
    msg += ` at $${listing.price.toLocaleString()}`;
    if (listing.description) {
      const desc = listing.description.slice(0, 70);
      msg += ` – ${desc}${desc.length >= 70 ? '...' : ''}`;
    }
    msg += formatListingUrl(listing);
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  }
];

// ─── Advanced Stat Templates ────────────────────────────────────
const statTemplates = [
  // Template 1: Professional analysis
  (stat) => {
    const intros = [
      `📊 Here's what the numbers say:`,
      `📈 Let's look at the data:`,
      `💡 Key market indicator:`,
      `🔍 Important stat to know:`,
      `📉 Market analysis:`
    ];
    return `${random(intros)} ${stat.metric} in ${stat.region} is ${stat.value}. ${random(ALL_CTAS)} #KYMarket`;
  },
  // Template 2: Personal insight
  (stat) => {
    const insights = [
      `As someone who watches the market daily, here's what I see:`,
      `From my experience in Louisville real estate:`,
      `I've been tracking this trend closely:`,
      `Here's what this means for buyers and sellers:`,
      `This is significant for our market:`
    ];
    return `${random(insights)} ${stat.metric} is now ${stat.value} in ${stat.region}. ${random(ALL_CTAS)}`;
  },
  // Template 3: Question-focused
  (stat) => {
    const questions = [
      `What does this mean for you?`,
      `Is this good news?`,
      `How does this affect your buying power?`,
      `Thinking about selling? Consider this:`,
      `Wondering about market timing? Check this out:`
    ];
    return `${random(questions)} ${stat.metric}: ${stat.value} in ${stat.region}. ${random(ALL_CTAS)} #LouisvilleRealEstate`;
  },
  // Template 4: Action-oriented
  (stat) => {
    const actions = [
      `Smart buyers are paying attention to this:`,
      `Here's why you should care about this stat:`,
      `This data point is crucial for your decision:`,
      `Want to make informed decisions? Consider this:`,
      `Here's what successful investors are watching:`
    ];
    return `${random(actions)} ${stat.metric} in ${stat.region} is ${stat.value}. ${random(ALL_CTAS)}`;
  },
  // Template 5: Trend-focused
  (stat) => {
    const trends = [
      `The trend is clear:`,
      `We're seeing a pattern:`,
      `The market is showing:`,
      `Consistent data shows:`,
      `The numbers tell us:`
    ];
    return `${random(trends)} ${stat.metric} sits at ${stat.value} in ${stat.region}. ${random(ALL_CTAS)} #ZerricInsights`;
  }
];

// ─── Advanced News Templates ────────────────────────────────────
const newsTemplates = [
  // Template 1: Breaking news style
  (news) => {
    const intros = [
      `📰 Breaking news for Louisville:`,
      `🔔 Important development:`,
      `📢 Big news in real estate:`,
      `🏙️ Major announcement:`,
      `💥 Just in:`
    ];
    return `${random(intros)} ${news.headline} – ${news.summary.slice(0, 120)}... ${random(ALL_CTAS)} #KYNews`;
  },
  // Template 2: Impact-focused
  (news) => {
    const impacts = [
      `Here's how this affects you:`,
      `This matters for homeowners:`,
      `This changes things:`,
      `What this means for the market:`,
      `You need to know this:`
    ];
    return `${random(impacts)} ${news.headline}. ${news.summary.slice(0, 100)}... ${random(ALL_CTAS)} #Louisville`;
  },
  // Template 3: Analysis style
  (news) => {
    const analyses = [
      `Let me break this down for you:`,
      `Here's my take on this news:`,
      `What this really means:`,
      `As a Realtor, here's how I interpret this:`,
      `The real story behind the headline:`
    ];
    return `${random(analyses)} ${news.headline} – ${news.summary.slice(0, 110)}... ${random(ALL_CTAS)} #KYMarket`;
  },
  // Template 4: Short and punchy
  (news) => {
    const punches = [
      `🗞️ Big news:`,
      `⚠️ Important update:`,
      `💡 Key development:`,
      `📣 Must-read:`,
      `✨ Major update:`
    ];
    return `${random(punches)} ${news.headline}. ${news.summary.slice(0, 90)}... ${random(ALL_CTAS)} #LouisvilleLiving`;
  },
  // Template 5: Opportunity-focused
  (news) => {
    const opportunities = [
      `Here's an opportunity you should know about:`,
      `This creates opportunity:`,
      `Smart investors are watching this:`,
      `This news opens doors:`,
      `Check out this development:`
    ];
    return `${random(opportunities)} ${news.headline} – ${news.summary.slice(0, 100)}... ${random(ALL_CTAS)} #ZerricRealty`;
  }
];

// ─── Advanced Event Templates ───────────────────────────────────
const eventTemplates = [
  // Template 1: Social event
  (event) => {
    const socials = [
      `📅 Mark your calendar!`,
      `🗓️ Don't miss this event!`,
      `📌 Save the date:`,
      `🎉 Exciting event coming up:`,
      `🤝 Join us for:`
    ];
    let msg = `${random(socials)} ${event.title} – ${event.description?.slice(0, 80)}...`;
    if (event.location) msg += ` at ${event.location}`;
    if (event.date) {
      const date = new Date(event.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      msg += ` on ${date}`;
    }
    msg += ` ${random(ALL_CTAS)} #LouisvilleEvents`;
    return msg;
  },
  // Template 2: Community focused
  (event) => {
    const communityStarts = [
      `🏘️ Great community event:`,
      `👥 Come together for:`,
      `🤗 The community is invited to:`,
      `💪 Local event alert:`,
      `🌟 Community gathering:`
    ];
    let msg = `${random(communityStarts)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 70)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #LouisvilleCommunity`;
    return msg;
  },
  // Template 3: Professional event
  (event) => {
    const professionalStarts = [
      `📊 Professional development opportunity:`,
      `💼 Industry event:`,
      `📈 Network and learn:`,
      `🎓 Educational event:`,
      `🤝 Business networking:`
    ];
    let msg = `${random(professionalStarts)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 80)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #KYBusiness`;
    return msg;
  },
  // Template 4: Concise announcement
  (event) => {
    const announcements = [
      `📢 Just announced:`,
      `🗣️ Happening soon:`,
      `📋 New event:`,
      `✨ Coming up:`,
      `🎯 Don't forget:`
    ];
    let msg = `${random(announcements)} ${event.title}`;
    if (event.description) {
      const desc = event.description.slice(0, 60);
      msg += ` – ${desc}${desc.length >= 60 ? '...' : ''}`;
    }
    if (event.location) msg += ` in ${event.location}`;
    msg += ` ${random(ALL_CTAS)}`;
    return msg;
  },
  // Template 5: Interactive invitation
  (event) => {
    const invitations = [
      `🎟️ Who's coming?`,
      `👋 Will I see you there?`,
      `🤝 Let's connect:`,
      `🌟 Be there:`,
      `💬 Let's discuss:`
    ];
    let msg = `${random(invitations)} ${event.title}`;
    if (event.description) msg += ` – ${event.description.slice(0, 70)}...`;
    if (event.location) msg += ` at ${event.location}`;
    msg += ` ${random(ALL_CTAS)} #ZerricEvents`;
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

// ─── Get niche-appropriate CTAs ────────────────────────────────
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
  let usedCTA = '';

  // ─── Determine content type (with weighted randomness) ────
  const contentTypes = [
    { value: 'trending', weight: 25 },
    { value: 'listing', weight: 25 },
    { value: 'stat', weight: 20 },
    { value: 'news', weight: 15 },
    { value: 'event', weight: 10 },
    { value: 'general', weight: 5 }
  ];
  
  const contentType = weightedRandom(contentTypes);
  
  // ─── Generate content based on type ────────────────────────
  let dataItem = null;
  let templateSet = null;
  let type = '';

  switch (contentType) {
    case 'trending': {
      const topics = await getTrendingTopicsFromDB();
      if (topics.length > 0) {
        const topic = random(topics);
        const template = random(trendingTemplates);
        usedCTA = random(nicheCTAs);
        postContent = template(topic);
        dataType = 'trending';
        break;
      }
      // Fall through if no topics
    }
    
    case 'listing': {
      const filter = niche === 'Investment' ? { propertyType: 'Multi-Family' } : {};
      dataItem = await getRandomItem(Listing, filter);
      if (dataItem) {
        templateSet = listingTemplates;
        type = 'listing';
      }
      break;
    }
    
    case 'stat': {
      const filter = niche === 'Finance' ? { category: 'Economic' } : 
                     niche === 'Market Data' ? { category: 'Price' } : {};
      dataItem = await getRandomItem(MarketStat, filter);
      if (dataItem) {
        templateSet = statTemplates;
        type = 'stat';
      }
      break;
    }
    
    case 'news': {
      const filter = niche === 'Construction' ? { category: 'Development' } : {};
      dataItem = await getRandomItem(NewsItem, filter);
      if (dataItem) {
        templateSet = newsTemplates;
        type = 'news';
      }
      break;
    }
    
    case 'event': {
      const filter = niche === 'Neighborhood' ? { type: 'Community Meeting' } : {};
      dataItem = await getRandomItem(Event, filter);
      if (dataItem) {
        templateSet = eventTemplates;
        type = 'event';
      }
      break;
    }
    
    case 'general':
    default: {
      // Generic content with personality
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
    usedCTA = random(nicheCTAs);
    postContent = template(dataItem);
    dataType = type;
    
    if (dataItem.images && dataItem.images.length > 0) {
      image = dataItem.images[0];
    }
  }

  // ─── Ensure CTA is included ──────────────────────────────────
  if (!postContent.includes('zerric.com') && !postContent.includes('Zerric')) {
    const ctaToAdd = random(nicheCTAs);
    postContent += ` ${ctaToAdd}`;
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

  // ─── Fetch a Pexels image (45% chance) ──
  if (!image && Math.random() < 0.45) {
    const queryMap = {
      'listing': random(['house', 'home', 'property', 'real estate', 'modern house']),
      'stat': random(['city', 'urban', 'downtown', 'cityscape', 'skyline']),
      'news': random(['city', 'skyline', 'buildings', 'construction']),
      'event': random(['people', 'crowd', 'meeting', 'community', 'gathering']),
      'trending': random(['louisville skyline', 'downtown louisville', 'louisville', 'kentucky']),
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