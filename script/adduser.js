module.exports.config = {
  name: "adduser",
  version: "1.0.1",
  role: 0,
  credits: "cliff",
  description: "Add user to group by id",
  hasPrefix: false,
  usage: "[args]",
  aliases: ["add"],
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const botID = api.getCurrentUserID();
  const out = msg => api.sendMessage(msg, threadID, messageID);
  var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
  var participantIDs = participantIDs.map(e => parseInt(e));

  if (event.messageReply) {
    const senderID = event.messageReply.senderID;
    return addUser(senderID, undefined); 
  }

  if (!args[0]) return out("Please enter an id/link profile user to add.");
  if (!isNaN(args[0])) return addUser(args[0], undefined);
  else {
    try {
      var [id, name, fail, link] = await getUID(args[0], api);
      if (fail == true && id != null) return out(id);
      else if (fail == true && id == null) return out("User ID not found.")
      else {
        await addUser(id, name || "Facebook users", link); 
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }
  }

  async function addUser(id, name, link) {
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
      else {
        if (link) {
          return out(`Added ${name ? name : "member"} to the group ! ${link}`); 
        } else {
          return out(`Added ${name ? name : "member"} to the group !`);
        }
      }
    }
  }
}
