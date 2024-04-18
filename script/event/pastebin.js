const axios = require('axios');
const path = require('path');
const fs = require('fs');
const request = require('request');

module.exports.config = {
  name: "pastebinThread&Admin",
  version: "69",
  credits: "liane"
};

const downloadDirectory = path.resolve(__dirname, 'cache');
const owner = '61557118090040';

module.exports.handleEvent = async function ({ api, event, admin }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const text = event.body;

  const pastebinLinkRegex = /https:\/\/pastebin\.com\/raw\/[\w+]/;

  if (event.body !== null && pastebinLinkRegex.test(event.body)) {
    api.getThreadInfo(threadID, (err, info) => {
      if (err) {
        console.error('Failed to get thread info:', err);
        return;
      }
      const threadName = info.threadName;
      api.sendMessage({
        body: `📜 | 𝗣𝗔𝗦𝗧𝗘𝗕𝗜𝗡 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 𝗢𝗡\n\n𝖳𝗁𝗋𝖾𝖺𝖽: ${threadName || 'No-Name'}\nUser: ${event.senderID}\n\n𝖫𝗂𝗇𝗄:\n\n${event.body}`,
        url: event.body
      }, owner);
    });
  }

  const regex = /https:\/\/pastebin\.com\/raw\/\S+$/g;

  if (regex.test(text)) {
    const link = 'https://i.postimg.cc/3RLHGcJp/New-Project-1212-79-D6215.png';
    const callback = () => api.sendMessage({ body: `Pastebin link detected! Some user sent the link of pastebin in this group`, attachment: fs.createReadStream(__dirname + "/cache/alert.jpg") }, threadID, () => fs.unlinkSync(__dirname + "/cache/alert.jpg", messageID));
    return request(link).pipe(fs.createWriteStream(__dirname + "/cache/alert.jpg")).on("close", () => callback());
  }

  if (regex.test(text)) {
    const imageUrl = 'https://i.postimg.cc/7LytZnDk/Screenshot-2023-11-01-23-32-56-32.jpg';
    const responseText = 'Pastebin Alert!';
    try {
      const response = await axios.get(text);

      if (response.status == 200) {
        const link = imageUrl;
        const callback = () => api.sendMessage({ body: responseText, attachment: fs.createReadStream(downloadDirectory + "/alert.jpg") }, threadID, () => fs.unlinkSync(downloadDirectory + "/alert.jpg", messageID + owner));
        return request(link).pipe(fs.createWriteStream(downloadDirectory + "/alert.jpg")).on("close", () => callback());
      } else {
        return api.sendMessage('Invalid Pastebin URL', threadID, messageID);
      }
    } catch (err) {
      return api.sendMessage('Something went wrong', threadID, messageID);
    }
  }
};