const app = require('./app');
const startBotService = require('./services/botService');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Start the bot service (only in production or always)
  if (process.env.NODE_ENV !== 'test') {
    startBotService();
  }
});