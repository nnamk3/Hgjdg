let isReactEnabled = true;

const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;

function extractEmojis(message) {
  if (!message) return null;
  const match = message.match(emojiRegex);
  return match ? match[0] : null;
}

module.exports.config = {
  name: "react",
  version: "1.0",
  role: 0,
  credits: 'cliff',
  description: `Turn on/off automatic reaction`,
  hasPermission: 0,
  usePrefix: false,
  commandCategory: 'system',
  usages: 'react [on/off]',
  hasPrefix: false,
  usage: '{pn} on/off',
  cooldowns: 5,
};

module.exports.handleEvent = async ({ api, event, args }) => {
  try {
    const message = event.body;
    const emojis = extractEmojis(message);

    if (isReactEnabled && emojis) {
      api.setMessageReaction(emojis, event.messageID, () => {}, true);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (args[0] === 'on') {
      isReactEnabled = true;
      api.sendMessage('The react function is now enabled for new messages.', event.threadID, event.messageID);
    } else if (args[0] === 'off') {
      isReactEnabled = false;
      api.sendMessage('The react function has been disabled for new messages.', event.threadID, event.messageID);
    } else {
      api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
  }
};
