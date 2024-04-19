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
 const b = require('axios');
  let user = args.join(" ");
try {
  if (!user){ return api.sendMessage("Please provide a question first!", event.threadID, event.messageID)
}
api.sendMessage(`Please wait while I think through your request...`,event.threadID, event.messageID);
  const res = await b.get(`https://haze-llm-model-74e9fe205264.herokuapp.com/api/chat?content=${user}`);
let resu = res.data.content;
api.sendMessage(resu, event.threadID, event.messageID)
    } catch (err){
return api.sendMessage("API Error", event.threadID, event.messageID)
     }  
  }