module.exports.config = {
  name: 'gpt2',
  version: '1.1.1',
  hasPermssion: 0,
  role: 0,
  credits: 'hazey_api',
  description: 'An AI powered by ChatGPT',
  usePrefix: false,
  hasPrefix: false,
  commandCategory: 'chatbots',
  usages: '[prompt]',
  usage: 'prompt',
  cooldowns: 0,
  aliases: ["GPT2","Gpt2"],
  cooldown: 0,
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  let user = args.join(" ");
  try {
    if (!user) { 
      return api.sendMessage("Please provide a question first!", event.threadID, event.messageID);
    }
    api.sendMessage(`Please wait while I think through your request...`, event.threadID, event.messageID);
    const response = await axios.get(`https://haze-llm-model-74e9fe205264.herokuapp.com/api/chat?content=${user}`);
    const responseData = response.data;
    const content = responseData.choices[0].message.content;
    api.sendMessage(content, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
  }  
}
