const User = require('../models/User');
const Post = require('../models/Post');
const { randomInt } = require('crypto');

const botDefs = [
  { name: 'LouRealtyBot', username: 'lourealtybot', avatar: 'https://robohash.org/lourealtybot?set=set4&size=100x100' },
  { name: 'KYMarketBot', username: 'kymarketbot', avatar: 'https://robohash.org/kymarketbot?set=set4&size=100x100' },
  { name: 'NuLuDevBot', username: 'nuludevbot', avatar: 'https://robohash.org/nuludevbot?set=set4&size=100x100' },
  { name: 'HighlandsAgent', username: 'highlandsagent', avatar: 'https://robohash.org/highlandsagent?set=set4&size=100x100' },
  { name: 'KYInvestorBot', username: 'kyinvestorbot', avatar: 'https://robohash.org/kyinvestorbot?set=set4&size=100x100' },
  { name: 'LouClosingBot', username: 'louclosingbot', avatar: 'https://robohash.org/louclosingbot?set=set4&size=100x100' },
  { name: 'KYNewsBot', username: 'kynewsbot', avatar: 'https://robohash.org/kynewsbot?set=set4&size=100x100' },
  { name: 'StMatthewsRE', username: 'stmatthewsre', avatar: 'https://robohash.org/stmatthewsre?set=set4&size=100x100' },
  { name: 'LouRentalBot', username: 'lourentalbot', avatar: 'https://robohash.org/lourentalbot?set=set4&size=100x100' },
  { name: 'KYHistoricBot', username: 'kyhistoricbot', avatar: 'https://robohash.org/kyhistoricbot?set=set4&size=100x100' },
];

const botTemplates = [
  { content: 'Just listed: 3BR/2BA in the Highlands! 🏡 <a href="#">#LouisvilleRealEstate</a>' },
  { content: 'Market update: Louisville home prices up 4.2% year-over-year 📈 <a href="#">#KYRealEstate</a>' },
  { content: 'New commercial development coming to NuLu! 🏗️ 12 luxury condos + retail space. <a href="#">#NuLu</a>' },
  { content: 'Open house this Sunday at 1234 Bardstown Rd. Come see this beautiful colonial! ☕ <a href="#">#OpenHouse</a>' },
  { content: 'Thinking of selling? Average time on market in Louisville is now 28 days. 📊 <a href="#">#SellWithConfidence</a>' },
  { content: 'Just closed on a gorgeous property in Crescent Hill. Congrats to the buyers! 🎉 <a href="#">#DreamHome</a>' },
  { content: 'Louisville named top 10 emerging real estate markets in the Midwest. 🌟 <a href="#">#KentuckyProud</a>' },
  { content: 'Don\'t miss this 4BR/3BA with a pool in St. Matthews! 🏊 <a href="#">#LuxuryLiving</a>' },
  { content: 'New rental listings in Clifton: 2BR from $1,200/mo. Pet-friendly! 🐾 <a href="#">#LouisvilleRentals</a>' },
  { content: 'Old Louisville historic home tour this weekend! 12 Victorian beauties open. 🏛️ <a href="#">#OldLouisville</a>' },
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function ensureBotUsers() {
  for (const bot of botDefs) {
    const exists = await User.findOne({ username: bot.username });
    if (!exists) {
      await User.create({
        name: bot.name,
        username: bot.username,
        email: bot.username + '@scroll.city',
        password: 'botpassword', // will be hashed
        avatar: bot.avatar,
        isBot: true
      });
    }
  }
}

async function postBotMessage() {
  const botDef = getRandom(botDefs);
  const template = getRandom(botTemplates);
  const user = await User.findOne({ username: botDef.username });
  if (!user) return;

  // Check if last bot post was too recent (avoid duplicates)
  const lastPost = await Post.findOne({ isBot: true }).sort({ createdAt: -1 });
  if (lastPost && (Date.now() - lastPost.createdAt.getTime() < 8000)) return;

  await Post.create({
    user: user._id,
    userName: user.name,
    userHandle: user.username,
    userAvatar: user.avatar,
    content: template.content,
    isBot: true,
    image: Math.random() > 0.7 ? 'https://picsum.photos/seed/' + Date.now() + '/600/400' : '',
    video: ''
  });
}

function startBotService() {
  ensureBotUsers().then(() => {
    // Post immediately, then every 10-20 seconds
    postBotMessage();
    setInterval(() => {
      postBotMessage().catch(err => console.error('Bot error:', err));
    }, randomInt(10000, 20000));
  });
}

module.exports = startBotService;