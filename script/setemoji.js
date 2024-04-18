module.exports.config = {
  name: "setemoji",
  version: "1.0.0",
  role: 0,
  credits: "bao",
  description: "Đổi emoji trong nhóm",
  usages: "setemoji [emoji]",
  cooldowns: 3,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const emoji = args.join(" ")
  api.changeThreadEmoji(`${args.join(" ")}`, event.threadID, event.messagaID);
}