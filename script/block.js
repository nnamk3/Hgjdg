const fs = require('fs');

module.exports.config = {
  name: "block",
  version: '1.0.0',
  hasPermission: 2,
  role: 2,
  hasPrefix:false,
  usePrefix: false,
  credits: 'Eugene Aguilar',
  description: 'Block a user from using the bot',
  commandCategory: 'system',
  usages: '[userID]',
  cooldowns: 3,
  usage: '[userID]',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  var uid;

  if (args.join().includes('@')) {
    uid = Object.keys(event.mentions)[0];
  } else {
    uid = args[0];
  }

  if (event.type === "message_reply") {
    uid = event.messageReply.senderID;
  }

  if (Number.isNaN(Number(uid))) {
    api.sendMessage('Invalid user ID provided.', event.threadID, event.messageID);
    return;
  }

  if (args.length > 1) {
    const action = args[1].toLowerCase();

    if (action === 'unblock') {
      api.changeBlockedStatus(uid, false);
      api.sendMessage(`Successfully unblocked user ${uid}`, event.threadID, event.messageID);
    } else if (action === 'block') {
      api.changeBlockedStatus(uid, true);
      api.sendMessage(`Successfully blocked user ${uid}`, event.threadID, event.messageID);
    } else {
      api.sendMessage('Invalid command. Please use "block" or "unblock".', event.threadID, event.messageID);
    }
  } else {
    api.sendMessage('Missing command. Please use "block" or "unblock".', event.threadID, event.messageID);
  }
};