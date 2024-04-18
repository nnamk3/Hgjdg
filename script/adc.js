const { PasteClient } = require('pastebin-api');
const fs = require('fs');
const path = require('path');

module.exports.config = {
		name: "adc",
		version: "1.0",
		credits: "cliff",
		cooldown: 5,
		role: 2,
		hasPrefix: false,
		description: "Upload files to Pastebin and sends link",
		usage: "To use this command, type !pastebin <filename>. The file must be located in the current directory.",
		aliases: [],
};

module.exports .run = async function ({ api, event, args }) {
		const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb");

		const fileName = args[0];
		const filePathWithoutExtension = path.join(__dirname, fileName);
		const filePathWithExtension = path.join(__dirname, fileName + '.js');

		if (!fs.existsSync(filePathWithoutExtension) && !fs.existsSync(filePathWithExtension)) {
				return api.sendMessage('File not found!', event.threadID);
		}

		const filePath = fs.existsSync(filePathWithoutExtension) ? filePathWithoutExtension : filePathWithExtension;

		fs.readFile(filePath, 'utf8', async (err, data) => {
				if (err) {
						console.error(err);
						return api.sendMessage('Error reading the file!', event.threadID);
				}

				const url = await client.createPaste({
						code: data,
						expireDate: 'N',
						format: "javascript",
						name: fileName,
						publicity: 1
				}).catch((error) => {
						console.error(error);
						return api.sendMessage('Error uploading the file to Pastebin!', event.threadID);
				});

				if (url) {
						const id = url.split('/')[3];
						const rawPaste = 'https://pastebin.com/raw/' + id;
						api.sendMessage(`File uploaded to Pastebin: ${rawPaste}`, event.threadID);
				}
		});
};