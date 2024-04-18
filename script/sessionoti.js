const fs = require('fs');
const path = require('path');

module.exports.config = {
	name: "sessionbot",
	version: "1.0.0",
	credits: "developer",
	role: 2, 
	usage: "[prefix]sendnoti",
	hasPrefix: false,
	cooldown: 0
};

module.exports.run = async function ({ api, event, args }) {
	try {
		const allowedUserIDs = ["61557118090040"]; 
		const senderID = event.senderID.toString();
		if (!allowedUserIDs.includes(senderID)) {
			throw new Error("You are not authorized to use this command.");
		}

		const notificationMessage = args.join(" ");

		const sessionFolder = path.join('./data/session');
		if (!fs.existsSync(sessionFolder)) {
			throw new Error("Session folder does not exist.");
		}

		const files = fs.readdirSync(sessionFolder);
		for (const file of files) {
			if (file.endsWith('.json')) {
				const uid = file.split('.')[0];
				try {
					await api.sendMessage(notificationMessage, uid);
					console.log(`Notification sent to UID ${uid}`);
				} catch (error) {
					console.error(`Failed to send notification to UID ${uid}: ${error.message}`);
				}
			}
		}

		api.sendMessage("Notifications sent to all users.", event.threadID);
	} catch (error) {
		console.error(`Error in sendnoti command: ${error.message}`);
		api.sendMessage("An error occurred. Please try again later.", event.threadID);
	}
};
