const axios = require('axios');
const cheerio = require('cheerio');

module.exports.config = {
  name: "adduser",
  version: "1.0.1",
  role: 0,
  hasPermission: 0,
  credits: "cliff",
  description: "Add user to group by id",
  hasPrefix: false,
  commandCategory: "group",
  usages: "adduser [id] [link]",
  usage: "[args]",
  aliases: ["add","Add"],
  cooldowns: 5,
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const botID = api.getCurrentUserID();
  const out = msg => api.sendMessage(msg, threadID, messageID);
  var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
  var participantIDs = participantIDs.map(e => parseInt(e));
  if (!args[0]) return out("Please enter a UID/link profile user to add.");
  if (!isNaN(args[0])) return adduser(args[0], args[1]); // Pass the link argument to adduser
  else {
    try {
      var [id, name, fail] = await getUID(args[0], api, args[1]); // Pass the link argument to getUID
      if (fail == true && id != null) return out(id);
      else if (fail == true && id == null) return out("User ID not found.")
      else {
        await adduser(id, name || "Facebook users", args[1]); // Pass the link argument to adduser
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }
  }

  async function adduser(id, name, link) {
    id = parseInt(id);
    if (participantIDs.includes(id)) return out(`${name ? name : "Member"} is already in the group.`);
    else {
      var admins = adminIDs.map(e => parseInt(e.id));
      try {
        await api.addUserToGroup(id, threadID);
      }
      catch {
        return out(`Can't add ${name ? name : "user"} in group.`);
      }
      if (approvalMode === true && !admins.includes(botID)) return out(`Added ${name ? name : "member"} to the approved list !`);
      else return out(`Added ${name ? name : "member"} to the group !`)
    }
  }
}

async function getUID(input, api, link) { // Pass the link argument to getUID
  try {
    const id = await findUid(input, link); // Pass the link argument to findUid
    const name = await getUserNames(api, id);
    return [id, name];
  } catch (error) {
    throw error;
  }
}

async function getUserNames(api, uid) {
    try {
        const userInfo = await api.getUserInfo([uid]);
        return Object.values(userInfo).map(user => user.name || `User${uid}`);
    } catch (error) {
        console.error('Error getting user names:', error);
        return [];
    }
}

async function findUid(input, link) {
  try {
    if (link && link.includes("facebook.com")) { 
      const html = await axios.get(link);
      const $ = cheerio.load(html.data);
      const el = $('meta[property="al:android:url"]').attr('content');
      if (!el) {
        throw new Error('UID not found');
      }
      const number = el.split('/').pop();
      return number;
    } else {
      return input;
    }
  } catch (error) {
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
