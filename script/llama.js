const axios = require('axios');

module.exports.config = {
  name: 'llma',
  credits: "cliff",
  version: '1.0.0',
  role: 0,
  aliases: ['llma'],
  cooldown: 0,
  cooldowns: 0,
  hasPrefix: false,
  usage: "{pn} [prompt]",
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(' ');

  async function sendMessage(msg) {
    api.sendMessage(msg, event.threadID, event.messageID);
  }

  if (!prompt) {
    await sendMessage("Please provide your question.");
    return;
  }

  const url = "https://69070.replit.app/meta";

  try {
    const response = await axios.get(`${url}?prompt=${encodeURIComponent(prompt)}`);
    await sendMessage(response.data.finalResponse);
  } catch (error) {
    await sendMessage("An error occurred while fetching the response");
  }
};