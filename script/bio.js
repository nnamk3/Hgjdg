module.exports.config = {
  name: "bio",
  version: "1.0.0",
  credits: "cliff",
  role: 2,
  hasPermision: 2,
  description: "change bot's bio",
  aliases: ["setbio"],
  commandCategory: "Bio",
  hasPrefix: false,
  usePrefix: false,
  usages: "{p}{n} [bio] [publish]",
  cooldown: 5,
  usage: "{p}{n} [bio] [publish]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  if (args.length < 1) {
    return api.sendMessage("Please provide your new bio.", threadID, messageID);
  }

  const bio = args.slice(0, args.length - 1).join(" ");
  const publish = args[args.length - 1] === "true";

  try {
    await api.changeBio(bio, publish);
    return api.sendMessage("My Bio now  updated successfully.", threadID);
  } catch (error) {
    console.error("Error changing bio:", error);
    return api.sendMessage("Failed to update bio. Please try again later.", threadID, messageID);
  }
};
