module.exports.config = {
  name: "ai",
  version: "0.0.2",
  role: 0,
  aliases: [],
  hasPrefix: false,
  credits: "cliff",
  description: "",
  usage: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const { gpt } = require("nayan-server");

  const uid = event.senderID;
  const np = args.join(" ");

  gpt({
    messages: [
      {
        role: "Gpt-4",
        content: "Hello! How are you today?"
      },
      {
        role: "user",
        content: `Hello i am a artificial intelligence created by cliff, i am here to help you with your questions and tasks.`
      },
      {
        role: "Gpt-4",
        content: `Hello, ! How are you today?`
      }
    ],
    prompt: `${np}`,
    model: "Gpt-4",
    markdown: false
  }, async (err, data) => { 
    if (err) {
      console.error("Error:", err);
      return;
    }

    const answer = data.gpt;
    const msg = `${answer}`;
    try {
      await api.sendMessage({ body: msg }, event.threadID); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
};
