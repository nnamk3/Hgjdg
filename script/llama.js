const { get } = require('axios');

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
    api.sendMessage("Please provide your question.", event.threadID, event.messageID);
    return;
}

 const url = "https://69070.replit.app/meta";

 try {
  const response = await get(`${url}?prompt=${encodeURIComponent(prompt)}`);
  await sendMessage(response.data.finalResponse);
 } catch (error) { 
   await sendMessage("An error occured while fetching the response");
 }
};
