const fs = require('fs');
const path = require('path');

module.exports.config = {
		name: "sessionadmin",
		version: "1.0.0",
		credits: "developer",
		role: 2, 
		usage: "[prefix]sessionadminoti",
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

				const historyPath = path.join('./data/history.json');
				if (!fs.existsSync(historyPath)) {
						throw new Error("History file does not exist.");
				}

				const historyData = fs.readFileSync(historyPath, 'utf-8');
				const historyJson = JSON.parse(historyData);

				for (const session of historyJson) {
						const adminUID = session.admin[0]; 
						try {
								await api.sendMessage(notificationMessage, adminUID);
								console.log(`Notification sent to UID ${adminUID}`);
						} catch (error) {
								console.error(`Failed to send notification to UID ${adminUID}: ${error.message}`);
						}
				}

				api.sendMessage("Notifications sent to all admins.", event.threadID);
		} catch (error) {
				console.error(`Error in sendnoti command: ${error.message}`);
				api.sendMessage("An error occurred. Please try again later.", event.threadID);
		}
};
