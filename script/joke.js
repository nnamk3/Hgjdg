const axios = require('axios');

module.exports.config = {
    name: "joke",
    version: "1.0.0",
    role: 0,
    hasPrefix: false,
    description: "Get a random joke.",
    usage: "joke",
    credits: "Develope",
    cooldown: 0
};

module.exports.run = async ({ api, event }) => {
    const { threadID } = event;

    try {

        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const { setup, punchline } = response.data;


        api.sendMessage(`${setup}\n${punchline}`, threadID);
    } catch (error) {
        api.sendMessage("Sorry, I couldn't fetch a joke at the moment. Please try again later.", threadID);
    }
};
