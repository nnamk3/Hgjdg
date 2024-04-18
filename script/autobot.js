module.exports.config = {
  name: "autobot",
  aliases: ["fbbot"],
  description: "This command make your account bot",
  hasPrefix: true,
  credits: "cliff",
  usage: "[name of cmd] [appstate] [prefix] [your_uid] [bot_name]",
  version: "1.0.0",
  role: 2,
  cooldown: 0
};

module.exports.run = async ({ api, event, args }) => {

  const input = args[0];
  const input_state = args[1]
  const input_prefix = args[2];
  const input_admin = args[3];
  const input_botName = args[4];
  const input_adminName = args[5];

  if (!input) {
    api.sendMessage(`This command make your account bot by providing requirements, Autobot [Appstate] [prefix] [admin_uid]`, event.threadID, event.messageID);
    return;
  } else if (input == "online") {
    try {
      api.sendMessage("Please wait...", event.threadID, event.messageID);    
    const urlsz = "https://fb-autobot-c53bafc5dd08.herokuapp.com/info";   
    const response = await fetch(urlsz); 
    const aiList = await response.json();
    let message = "";
        if (Array.isArray(aiList)) {
          aiList.forEach((result, index) => {
     const { name, profileUrl, time } = result;
    const days = Math.floor(time / (3600 * 24));
    const hours = Math.floor((time % (3600 * 24)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
        message += `( ${index + 1} )\nName: ${name}\n\nFacebook: ${profileUrl}\n\nUptime: ${days}:${hours}:${minutes}:${seconds}\n\n`;
})
     api.sendMessage(`List of Active.\n\n${message}`, event.threadID, event.messageID);
        } else {
  api.sendMessage("Handle error: aiList is not an array", event.threadID, event.messageID);
  console.error("Error: aiList is not a valid array");
        }
    } catch (err) {
      api.sendMessage(err.message, event.threadID, event.messageID)
      console.log(err)
    }
  } else if (input == "create") {

    try {
      const states = JSON.parse(input_state);
      if (states && typeof states === 'object') {

        let cmds = [{
          'commands': ["active-session","adduser","ai","4chan","anime","adc","bard","artify","bard","besh","blackbox","brain test","calculate","internet","baby","cmds","axis","chat","dictionary","file","emojimix","font","colorroulette","count","emojiroulette","filter","numberguess","rps","slot","give","fbshield","help","hesoyam","homeless","listbox","gpt4","lyrics","voice","out","pinterest","poli","quote","recipe","remini","removebg","say","shoti","sim","popcat","sing","teach","tempmail","tid","tiktoksearch","tokenget","translator","delete","uid","unsend","uptime","wanted"]
}, {
          'handleEvent': ["antiout","resend","randomReact","mediaDL","cron"]
}];

        api.sendMessage('Creating please wait...', event.threadID, event.messageID);

        const response = await fetch('https://fb-autobot-c53bafc5dd08.herokuapp.com/login', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: states,
            commands: cmds,
            prefix: input_prefix,
            admin: input_admin,
            botName: input_botName,
            adminName: input_adminMame
          }),
        });
        const data = await response.json();
        if (data.success === 200) {
          api.sendMessage(`${data.message}`, event.threadID, event.messageID)
          console.log(data.message)
        } else {
          api.sendMessage(`${data.message}`, event.threadID, event.messageID)
        }
      } else {
        api.sendMessage('Invalid JSON data. Please check your input.', event.threadID, event.messageID);
      }
    } catch (parseErr) {
      api.sendMessage(`${parseErr.message}`, event.threadID, event.messageID)
      console.error(parseErr);
    }
  }
};