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
  if (!isNaN(args[0])) return adduser(args[0], undefined);
  else {
    try {
      var [id, name, fail, link] = await getUID(args[0], api);
      if (fail == true && id != null) return out(id);
      else if (fail == true && id == null) return out("User ID not found.")
      else {
        await adduser(id, name || "Facebook users");
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }
  }

  async function adduser(id, name) {
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

async function getUID(input, api) {
  try {
    const id = await findUid(input);
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

async function findUid(input) {
  try {
    if (input.includes("facebook.com")) {
      const response = await axios.post(
        'https://seomagnifier.com/fbid',
        new URLSearchParams({
          'facebook': '1',
          'sitelink': input
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'PHPSESSID=0d8feddd151431cf35ccb0522b056dc6'
          }
        }
      );
      const id = response.data;
      if (isNaN(id)) {
        const html = await axios.get(input);
        const $ = cheerio.load(html.data);
        const el = $('meta[property="al:android:url"]').attr('content');
        if (!el) {
          throw new Error('UID not found');
        }
        const number = el.split('/').pop();
        return number;
      }
      return id;
    } else {
      return input;
    }
  } catch (error) {
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
