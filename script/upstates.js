const axios = require('axios');

module.exports.config = {
  name: "appstate",
  version: "1.0.0",
  role: 0,
  credits: "cliff",//api by mark
  description: "Retrieve user data",
  cooldowns: 5,
  aliases: ["fbstate","upstate"],
  usage: "{p}{n} email and password",
  hasPrefix: false,
};

module.exports.run = async ({ api, event, args }) => {
    if (args.length !== 2) {
        return api.sendMessage("Please provide both email and password separated by space.", event.threadID, event.messageID);
    }

    const [email, password] = args.map(arg => arg.trim());

    try {
        const res = await axios.get(`https://appstate-get-86f7174544ec.herokuapp.com/cookie?email=${email}&password=${password}`);
        const userData = res.data;

        if (userData.success) {
            const formattedData = userData.session_cookies.map(item => ({
                "key": item.key,
                "value": item.value,
                "domain": item.domain,
                "path": item.path,
                "hostOnly": item.hostOnly,
                "creation": item.creation,
                "lastAccessed": item.lastAccessed
            }));

            return api.sendMessage(JSON.stringify(formattedData, null, 4), event.threadID, event.messageID);
        } else {
            return api.sendMessage("Failed to retrieve user data. Please check your credentials.", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Error:", error);
        return api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
}
