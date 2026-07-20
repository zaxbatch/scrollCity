const User = require('../models/User');
const Post = require('../models/Post');
const BotPersona = require('../models/BotPersona');
const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');

// ─── Helper: random item from array ──────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Helper: safe URL formatting ──────────────────────────────
const formatListingUrl = (listing) => {
  if (listing.url && listing.url.trim()) {
    return ` See the listing here: ${listing.url.trim()}`;
  }
  return '';
};

// ─── Website URLs ──────────────────────────────────────────────
const MAIN_URL = 'https://zerric.com';
const MORTGAGE_URL = 'https://zerric.com/mortgage-calculator';
const GUESTBOOK_URL = 'https://zerric.com/guest-book';
const SEARCH_URL = 'https://zerric.com/property-search';

// ─── Trending Topics ──────────────────────────────────────────
const TRENDING_TOPICS = [
  // ... (keep as before)
];

// ─── CTAs ──────────────────────────────────────────────────────
const CTAS = [
  // ... (keep as before)
];

// ─── UPDATED Listing Templates (safe URL) ──────────────────────
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

// ─── Other templates (stat, news, event) remain unchanged ───
// ... (keep your existing statTemplates, newsTemplates, eventTemplates)

// ─── Rest of botService.js (scheduler, fetch, etc.) ──────────
// ... (keep your existing code)