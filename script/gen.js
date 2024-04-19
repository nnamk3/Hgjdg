module.exports.config = {
		name: "gen",
	  version: "25.0.0",
		hasPrefix: false,
		role: 2,
		description: "Generate image",
		usages: "[text]",
		credits: "Deku",
		aliases: ["Gen"],
    cooldown: 10
};

module.exports.run = async function ({ api, event, args }) {
		let t = args.join(" ");
		if (!t) return api.sendMessage('Missing prompt!', event.threadID, event.messageID);
		api.sendMessage('Processing request...', event.threadID, event.messageID);
		const axios = require('axios');
		const fs = require('fs');
		const { Prodia } = require("prodia.js");

		try {
				const prodia = new Prodia("7e33be3f-5af6-42b2-854b-6439b3732050");
				const bestModel = ["absolutereality_V16.safetensors [37db0fc3]", "absolutereality_v181.safetensors [3d9d4d2b]", "amIReal_V41.safetensors [0a8a2e61]", "ICantBelieveItsNotPhotography_seco.safetensors [4e7a3dfd]"];
				let url = [];
				let image = [];

				for (let i of bestModel) {
						const generate = await prodia.generateImage({
								prompt: t,
								model: i,
								negative_prompt: "BadDream, (UnrealisticDream:1.3)",
								sampler: "DPM++ SDE Karras",
								cfg_scale: 9,
								steps: 30,
								aspect_ratio: "portrait"
						});

						while (generate.status !== "succeeded" && generate.status !== "failed") {
								await new Promise(resolve => setTimeout(resolve, 250));
								const job = await prodia.getJob(generate.job);

								if (job.status === "succeeded") {
										console.log(job);
										url.push(job.imageUrl);
										break;
								}
						}
				}

				let c = 0;
				for (let urls of url) {
						c += 1;
						const pathh = __dirname + "/../cache/generated-" + c + ".png";
						const response = await axios.get(urls, { responseType: "arraybuffer" });
						fs.writeFileSync(pathh, Buffer.from(response.data, "binary"));
						image.push(fs.createReadStream(pathh));
				}

				console.log('Downloaded');
				return api.sendMessage({ body: "Here's the results", attachment: image }, event.threadID, event.messageID);
		} catch (e) {
				return api.sendMessage(e.message, event.threadID, event.messageID);
		}
};