const axios = require('axios');

module.exports.config = {
	name: 'npm',
	version: '2.1.0',
	credits: 'Cliff',
	cooldown: 5,
  cooldowns: 5,
	role: 0,
  commandCategory: "info",
  hasPermision: 0,
	aliases: ['npm','Npm','NPM'],
	description: 'Get info on Npm package',
	hasPrefix: false,
  usePrefix: false,
	usage: '{p}npm your text',
  usages: '{p}npm your text' 
};

module.exports.run = async function ({ api, event, args }) {
	const query = encodeURIComponent(args.join(' '));

	try {
		const response = await axios.get(`https://api.popcat.xyz/npm?q=${query}`);
		const npmInfo = response.data;

		api.sendMessage(`NPM Package Info: ${JSON.stringify(npmInfo)}`, event.threadID);
	} catch (error) {
		console.error('Error fetching NPM package info:', error);
		api.sendMessage('Error fetching NPM package info. Please try again later.', event.threadID);
	}
};
