const fs = require('fs');
const path = require('path');
const login = require('./fb-chat-api/index');
const express = require('express');
const app = express();
const chalk = require('chalk');
const gradient = require('gradient-string');
const bodyParser = require('body-parser');
const axios = require('axios');
const script = path.join(__dirname, 'script');
const moment = require("moment-timezone");
const cron = require('node-cron');
const config = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : creatqeConfig();
const Utils = new Object({
  commands: new Map(),
  handleEvent: new Map(),
  account: new Map(),
  ObjectReply: new Map(),
  handleReply: [],
  cooldowns: new Map(),
    getTime: function(option) {
    switch (option) {
      case "seconds":
        return `${moment.tz("Asia/Manila").format("ss")}`;
      case "minutes":
        return `${moment.tz("Asia/Manila").format("mm")}`;
      case "hours":
        return `${moment.tz("Asia/Manila").format("HH")}`;
      case "date":
        return `${moment.tz("Asia/Manila").format("DD")}`;
      case "month":
        return `${moment.tz("Asia/Manila").format("MM")}`;
      case "year":
        return `${moment.tz("Asia/Manila").format("YYYY")}`;
      case "fullHour":
        return `${moment.tz("Asia/Manila").format("HH:mm:ss")}`;
      case "fullYear":
        return `${moment.tz("Asia/Manila").format("DD/MM/YYYY")}`;
      case "fullTime":
        return `${moment.tz("Asia/Manila").format("HH:mm:ss DD/MM/YYYY")}`;
    }
  },
  timeStart: Date.now()
});
console.log(gradient.instagram('[ PREPARING DEPLOYING VARIABLES ]'));
fs.readdirSync(script).forEach((file) => {
  const scripts = path.join(script, file);
  const stats = fs.statSync(scripts);
  if (stats.isDirectory()) {
    fs.readdirSync(scripts).forEach((file) => {
      try {
        const {
          config,
          run,
          handleEvent,
          handleReply
        } = require(path.join(scripts, file));
        if (config) {
          const {
            name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'
          } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));
          aliases.push(name);
          if (run) {
            Utils.commands.set(aliases, {
              name,
              role,
              run,
              aliases,
              description,
              usage,
              version,
              hasPrefix: config.hasPrefix,
              credits,
              cooldown
            });
          }
          if (handleEvent) {
            Utils.handleEvent.set(aliases, {
              name,
              handleEvent,
              role,
              description,
              usage,
              version,
              hasPrefix: config.hasPrefix,
              credits,
              cooldown
            });
          }
          if (handleReply) {
              Utils.ObjectReply.set(aliases, {
                name,
                handleReply,
              });
            }
          }
      } catch (error) {
        console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));
      }
    });
  } else {
    try {
      const {
        config,
        run,
        handleEvent,
        handleReply
      } = require(scripts);
      if (config) {
        const {
          name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'
        } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));
        aliases.push(name);
        if (run) {
          Utils.commands.set(aliases, {
            name,
            role,
            run,
            aliases,
            description,
            usage,
            version,
            hasPrefix: config.hasPrefix,
            credits,
            cooldown
          });
        }
        if (handleEvent) {
          Utils.handleEvent.set(aliases, {
            name,
            handleEvent,
            role,
            description,
            usage,
            version,
            hasPrefix: config.hasPrefix,
            credits,
            cooldown
          });
        }
        if (handleReply) {
            Utils.ObjectReply.set(aliases, {
              name,
              handleReply,
            });
          }
        }
    } catch (error) {
      console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));
    }
  }
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.json());
const routes = [{
  path: '/',
  file: 'index.html'
}, {
  path: '/step_by_step_guide',
  file: 'guide.html'
}, {
  path: '/online_user',
  file: 'online.html'
},{
  path: '/random_shoti',
  file: 'shoti.html'
}, {
  path: '/analog',
  file: 'analog.html'
}, {
  path: '/clock',
  file: 'clock.html'
},{
  path: '/time',
  file: 'crazy.html'
},{
  path: '/developer',
  file: 'developer.html'
},{
  path: '/TokenGet',
  file: 'tokenGetter.html'
}, {
  path: '/random',
  file: 'random.html'
},{
  path: '/spotify',
  file: 'spotify.html'
},{
  path: '/allinone',
  file: 'allinone.html'
},{
  path: '/xnxx',
  file: 'xnxx.html'
},{
  path: '/Community',
  file: 'community.ltd.html'
}, ];
routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', route.file));
  });
});
app.get('/info', (req, res) => {
  const data = Array.from(Utils.account.values()).map(account => ({
    name: account.name,
    profileUrl: account.profileUrl,
    thumbSrc: account.thumbSrc,
    time: account.time
  }));
  res.json(JSON.parse(JSON.stringify(data, null, 2)));
});
app.get('/commands', (req, res) => {
  const command = new Set();
  const commands = [...Utils.commands.values()].map(({
    name
  }) => (command.add(name), name));
  const handleEvent = [...Utils.handleEvent.values()].map(({
    name
  }) => command.has(name) ? null : (command.add(name), name)).filter(Boolean);
  const role = [...Utils.commands.values()].map(({
    role
  }) => (command.add(role), role));
  const aliases = [...Utils.commands.values()].map(({
    aliases
  }) => (command.add(aliases), aliases));
  res.json(JSON.parse(JSON.stringify({
    commands,
    handleEvent,
    role,
    aliases
  }, null, 2)));
});
app.post('/login', async (req, res) => {
  const {
    state,
    commands,
    prefix,
    botName,
    adminName,
    admin
  } = req.body;
  try {
    if (!state) {
      throw new Error('Missing app state data');
    }
    const cUser = state.find(item => item.key === 'c_user');
    if (cUser) {
      const existingUser = Utils.account.get(cUser.value);
      if (existingUser) {
        console.log(`User ${cUser.value} is already logged in`);
        return res.status(400).json({
          error: false,
          message: "Active user session detected; already logged in",
          user: existingUser
        });
      } else {
        try {
          await accountLogin(state, commands, prefix, botName, adminName, [admin]);
          res.status(200).json({
            success: true,
            message: 'Authentication process completed successfully; login achieved.'
          });
        } catch (error) {
          console.error(error);
          res.status(400).json({
            error: true,
            message: error.message
          });
        }
      }
    } else {
      return res.status(400).json({
        error: true,
        message: "There's an issue with the appstate data; it's invalid."
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: "There's an issue with the appstate data; it's invalid."
    });
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(gradient.rainbow(`Server Running Port:${port}`));
  console.log(gradient.rainbow(`

  ░█████╗░██╗░░░██╗████████╗░█████╗░
  ██╔══██╗██║░░░██║╚══██╔══╝██╔══██╗
  ███████║██║░░░██║░░░██║░░░██║░░██║
  ██╔══██║██║░░░██║░░░██║░░░██║░░██║
  ██║░░██║╚██████╔╝░░░██║░░░╚█████╔╝
  ╚═╝░░╚═╝░╚═════╝░░░░╚═╝░░░░╚════╝░

    ██████╗░░█████╗░████████╗
    ██╔══██╗██╔══██╗╚══██╔══╝
    ██████╦╝██║░░██║░░░██║░░░
    ██╔══██╗██║░░██║░░░██║░░░
    ██████╦╝╚█████╔╝░░░██║░░░
    ╚═════╝░░╚════╝░░░░╚═╝░░░

      ██╗░░░██╗██████╗░
      ██║░░░██║╚════██╗
      ╚██╗░██╔╝░░███╔═╝
      ░╚████╔╝░██╔══╝░░
      ░░╚██╔╝░░███████╗
      ░░░╚═╝░░░╚══════╝


⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠿⠛⢉⣉⣠⣤⣤⣤⣴⣦⣤⣤⣀⡉⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠋⢁⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡟⠁⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠿⠂⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⡟⠀⣼⣿⣿⡏⢉⣁⣀⣀⣤⣤⣄⠀⣴⣿⣿⡇⢠⣶⣶⠒⠲⡆⢀⠈⢿⣿⣿⣿⣿⣿⣿⣿
⣿⠁⣼⣿⣿⣿⠀⢿⣿⣿⣏⣀⣹⠟⢀⣿⣿⣿⣷⡈⠛⠿⠃⢀⣠⣿⣆⠈⣿⣿⣿⣿⣿⣿⣿
⡇⢠⣿⣿⣿⣿⣧⣀⠉⠛⠛⠉⣁⣠⣾⣿⣿⣿⣿⣿⣷⣶⠾⠿⠿⣿⣿⡄⢸⣿⣿⣿⣿⣿⣿
⡇⢸⣿⣿⣿⣿⡿⠿⠟⠛⠛⠛⢉⣉⣉⣉⣉⣩⣤⣤⣤⣤⠀⣴⣶⣿⣿⡇⠀⣿⣿⣿⣿⣿⣿
⠅⢸⣿⣿⣿⣷⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⢸⣿⣿⣿⠃⢸⣿⣿⣿⠛⢻⣿
⣇⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠉⣿⡟⢀⣾⣿⠟⠁⣰⣿⣿⣿⡿⠀⠸⣿
⣿⣆⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠙⣠⣾⠟⠁⣠⣾⣿⣿⣿⣿⠀⣶⠂⣽
⣿⣿⣷⣄⡈⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⣴⠆⠀⠋⢀⣴⣿⣿⡿⠟⠛⠉⠀⢂⣡⣾⣿
⣿⣿⣿⣿⣿⠇⢀⣄⣀⡉⠉⠉⠉⠉⠉⣉⠤⠈⢁⣤⣶⠀⠾⠟⣋⡡⠔⢊⣠⣴⣾⣿⣿⣿⣿
⣿⣿⣿⣿⠏⢠⣿⣿⡿⠛⢋⣠⠴⠚⢉⣥⣴⣾⣿⣿⣿⠀⠴⠛⣉⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡏⢀⣿⣿⣯⠴⠛⠉⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⠀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡟⠀⣼⣿⣿⣧⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠃⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⡟⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⠃⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱
███████╗██╗░░░██╗░█████╗░██╗░░██╗
██╔════╝██║░░░██║██╔══██╗██║░██╔╝
█████╗░░██║░░░██║██║░░╚═╝█████═╝░
██╔══╝░░██║░░░██║██║░░██╗██╔═██╗░
██║░░░░░╚██████╔╝╚█████╔╝██║░╚██╗
╚═╝░░░░░░╚═════╝░░╚════╝░╚═╝░░╚═╝
██╗░░░██╗░█████╗░██╗░░░██╗
╚██╗░██╔╝██╔══██╗██║░░░██║
░╚████╔╝░██║░░██║██║░░░██║
░░╚██╔╝░░██║░░██║██║░░░██║
░░░██║░░░╚█████╔╝╚██████╔╝
░░░╚═╝░░░░╚════╝░░╚═════╝░
`));
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
async function accountLogin(state, enableCommands = [], prefix, botName, adminName, admin = []) {
  return new Promise((resolve, reject) => {
    login({
      appState: state
    }, async (error, api) => {
      if (error) {
        reject(error);
        return;
      }
      const userid = await api.getCurrentUserID();
      addThisUser(userid, enableCommands, state, prefix, botName, adminName, admin);
      try {
        const userInfo = await api.getUserInfo(userid);
        if (!userInfo || !userInfo[userid]?.name || !userInfo[userid]?.profileUrl || !userInfo[userid]?.thumbSrc) throw new Error('Unable to locate the account; it appears to be in a suspended or locked state.');
        const {
          name,
          profileUrl,
          thumbSrc
        } = userInfo[userid];
        let time = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(user => user.userid === userid) || {}).time || 0;
        Utils.account.set(userid, {
          name,
          profileUrl,
          thumbSrc,
          time: time
        });
        const intervalId = setInterval(() => {
          try {
            const account = Utils.account.get(userid);
            if (!account) throw new Error('Account not found');
            Utils.account.set(userid, {
              ...account,
              time: account.time + 1
            });
          } catch (error) {
            clearInterval(intervalId);
            return;
          }
        }, 1000);
      } catch (error) {
        reject(error);
        return;
      }
      api.setOptions({
        listenEvents: config[0].fcaOption.listenEvents,
        logLevel: config[0].fcaOption.logLevel,
        updatePresence: config[0].fcaOption.updatePresence,
        selfListen: config[0].fcaOption.selfListen,
        forceLogin: config[0].fcaOption.forceLogin,
        online: config[0].fcaOption.online,
        autoMarkDelivery: config[0].fcaOption.autoMarkDelivery,
        autoMarkRead: config[0].fcaOption.autoMarkRead,
      });
      try {
        var listenEmitter = api.listenMqtt(async (error, event) => {
          if (error) {
            if (error === 'Connection closed.') {
              console.error(`Error during API listen: ${error}`, userid);
            }
            console.log(error)
          }
          let database = fs.existsSync('./data/database.json') ? JSON.parse(fs.readFileSync('./data/database.json', 'utf8')) : createDatabase();
          let data = Array.isArray(database) ? database.find(item => Object.keys(item)[0] === event?.threadID) : {};
          let adminIDS = data ? database : createThread(event.threadID, api);
          let blacklist = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(blacklist => blacklist.userid === userid) || {}).blacklist || [];
          let hasPrefix = (event.body && aliases((event.body || '')?.trim().toLowerCase().split(/ +/).shift())?.hasPrefix == false) ? '' : prefix;
          let [command, ...args] = ((event.body || '').trim().toLowerCase().startsWith(hasPrefix?.toLowerCase()) ? (event.body || '').trim().substring(hasPrefix?.length).trim().split(/\s+/).map(arg => arg.trim()) : []);
          if (hasPrefix && aliases(command)?.hasPrefix === false) {
            api.sendMessage(`Invalid usage this command doesn't need a prefix`, event.threadID, event.messageID);
            return;
          }
          if (event.body && aliases(command)?.name) {
            const role = aliases(command)?.role ?? 0;
            const isAdmin = config?.[0]?.masterKey?.admin?.includes(event.senderID) || admin.includes(event.senderID);
            const isThreadAdmin = isAdmin || ((Array.isArray(adminIDS) ? adminIDS.find(admin => Object.keys(admin)[0] === event.threadID) : {})?.[event.threadID] || []).some(admin => admin.id === event.senderID);
            if ((role == 1 && !isAdmin) || (role == 2 && !isThreadAdmin) || (role == 3 && !config?.[0]?.masterKey?.admin?.includes(event.senderID))) {
              api.sendMessage(`You don't have permission to use this command.`, event.threadID, event.messageID);
              return;
            }
          }
          if (event.body && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && aliases(command)?.name) {
            if (blacklist.includes(event.senderID)) {
              api.sendMessage("We're sorry, but you've been banned from using bot. If you believe this is a mistake or would like to appeal, please contact one of the bot admins for further assistance.", event.threadID, event.messageID);
              return;
            }
          }
          if (event.body !== null) {
            if (event.logMessageType === "log:subscribe") {
                    const request = require("request");

           const autofont = {
  sansbold: {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶",
    j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿",
    s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    " ": " "
  },
};

const textToAutofont = (text, font) => {
  const convertedText = [...text].map(char => font[char] || char).join("");
  return convertedText;
};
      const modifiedBotName = textToAutofont(botName, autofont.sansbold);

      const ju = textToAutofont(adminName, autofont.sansbold);

      const luh = textToAutofont(prefix, autofont.sansbold);
                    const moment = require("moment-timezone");
                    var thu = moment.tz('Asia/Manila').format('dddd');
                    if (thu == 'Sunday') thu = 'Sunday'
                    if (thu == 'Monday') thu = 'Monday'
                    if (thu == 'Tuesday') thu = 'Tuesday'
                    if (thu == 'Wednesday') thu = 'Wednesday'
                    if (thu == "Thursday") thu = 'Thursday'
                    if (thu == 'Friday') thu = 'Friday'
                    if (thu == 'Saturday') thu = 'Saturday'
                    const time = moment.tz("Asia/Manila").format("HH:mm:ss - DD/MM/YYYY");										
                    const fs = require("fs-extra");
                    const { threadID } = event;

                if (event.logMessageData.addedParticipants && Array.isArray(event.logMessageData.addedParticipants) && event.logMessageData.addedParticipants.some(i => i.userFbId == userid)) {
                api.changeNickname(`》 ${prefix} 《 ❃ ➠ ${modifiedBotName}`, threadID, userid);

          let gifUrls = [
          'https://i.imgur.com/lrS3hJF.mp4',
          'https://i.imgur.com/9eNBFxt.mp4',
          'https://i.imgur.com/lmVFT8X.mp4',
          'https://i.imgur.com/1PqqNqr.mp4',
          'https://i.imgur.com/ytDThi8.mp4',
          'https://i.imgur.com/209z0iM.mp4',
          'https://i.imgur.com/VTZWEmH.mp4',
          'https://i.imgur.com/FO3UI1c.mp4',
          'https://i.imgur.com/X34qKhJ.mp4',
          'https://i.imgur.com/WK22w8v.mp4',
          'https://i.imgur.com/tvVDuo6.mp4',
          'https://i.imgur.com/3tgiqQd.mp4',
          'https://i.imgur.com/AfkKH9h.mp4',
          'https://i.imgur.com/wIGJBXq.mp4',
          'https://i.imgur.com/lmMWsR8.mp4',
          'https://i.imgur.com/x0c92nj.mp4'
          ];

          let randomIndex = Math.floor(Math.random() * gifUrls.length);
          let gifUrl = gifUrls[randomIndex];
          let gifPath = __dirname + '/cache/connected.mp4';

          axios.get(gifUrl, { responseType: 'arraybuffer' })
          .then(response => {           fs.writeFileSync(gifPath, response.data); 
              return api.sendMessage("𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗡𝗚...", event.threadID, () => 
                  api.sendMessage({ 
                      body:`🔴🟢🟡\n\n✅ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦! \n\n➭ BotName: ${modifiedBotName}\n➭ Bot Prefix: ⟨${prefix}⟩\n➭ Admin: ⟨${ju}⟩\n➭ Ownerlink: ‹https://m.facebook.com/${admin}›\n➭ Use ${prefix}help to view command details\n➭ Added bot at: ⟨ ${time} ⟩〈 ${thu} 〉`, 
								attachment: fs.createReadStream(gifPath)
						}, event.threadID)
				);
		})
          .catch(error => {
              console.error(error);
          });
                    } else {
                      try {
                        const fs = require("fs-extra");
                        let { threadName, participantIDs } = await api.getThreadInfo(threadID);

                        var mentions = [], nameArray = [], memLength = [], userID = [], i = 0;

                        let addedParticipants1 = event.logMessageData.addedParticipants;
                        for (let newParticipant of addedParticipants1) {
                          let userID = newParticipant.userFbId;
                          api.getUserInfo(parseInt(userID), (err, data) => {
                            if (err) { return console.log(err); }
                            var obj = Object.keys(data);
                            var userName = data[obj].name.replace("@", "");
                            if (userID !== api.getCurrentUserID()) {

                              nameArray.push(userName);
                              mentions.push({ tag: userName, id: userID, fromIndex: 0 });

                              memLength.push(participantIDs.length - i++);
                              memLength.sort((a, b) => a - b);

                                (typeof threadID.customJoin == "undefined") ? msg = "🌟 Hi!, {uName}\n┌────── ～●～ ──────┐\n----- Welcome to {threadName} -----\n└────── ～●～ ──────┘\nYou're the {soThanhVien} member of this group, please enjoy! 🥳♥" : msg = threadID.customJoin;
                                msg = msg
                                  .replace(/\{uName}/g, nameArray.join(', '))
                                  .replace(/\{type}/g, (memLength.length > 1) ? 'you' : 'Friend')
                                  .replace(/\{soThanhVien}/g, memLength.join(', '))
                                  .replace(/\{threadName}/g, threadName);
                              
          const bayot = [
          'https://i.ibb.co/0jfD13g/5bf47044-0957-4f8a-a166-9bca3f4aa7cd.jpg',
          'https://i.ibb.co/jhgc8Kj/ad523982-a45e-41db-836c-f76b5aaa4f9c.jpg',
          'https://i.ibb.co/vwMwRkn/aa13cba8-1c81-4062-87d0-272fcaf88212.jpg',
          'https://i.ibb.co/HC9wQVT/351c6943-dd38-4833-a1af-f06dafa4277f.jpg',
          'https://i.ibb.co/mNGVcRM/Background-Designs-de-Rise-of-the-Teenage-Mutant-Ninja-Turtles-THECAB.jpg','https://i.ibb.co/vwm61bY/Download-Dark-Purple-vector-background-with-bent-lines-for-free.jpg','https://i.ibb.co/FgLymH3/Liquid-Purple-art-painting-abstract.jpg','https://i.ibb.co/JqgvGBX/Free-Photo-Liquid-marbling-paint-texture-background-fluid-painting-abstract-texture-intensive-color.jp','https://i.ibb.co/HHHSWH4/36bc2c91-1426-44d9-9895-331c346aed0d.jpg','https://i.ibb.co/pPpGL7r/205-Amazing-Collections-of-Purple-Backgrounds.jpg','https://i.ibb.co/mBCcYvM/purple-smoke.jpg','https://i.ibb.co/zbfdqvZ/Purple-Butterflies.jpg','https://i.ibb.co/yXdBMkN/Rivet2.jpg','https://i.ibb.co/Pmd696Z/486dfd3c-2cd3-4db3-b29d-c64ffa124cc6.jpg','https://i.ibb.co/CWzCxZ5/Abstract-Wings.jpg'
          ];
          const sheshh = bayot[Math.floor(Math.random() * bayot.length)];

          const lubot = [
          'https://i.postimg.cc/wTZdtnfG/0.jpg',
          'https://i.postimg.cc/15wZqJkR/b05ee5c9-a589-4a47-a939-32ffde9280b3.jpg',
          'https://i.postimg.cc/wxRCCwT5/1.jpg',
          'https://i.postimg.cc/Cx5H2QwS/0767d076-eda6-4fab-b31e-6e93fb3b3db2.jpg',
          'https://i.postimg.cc/DwSL64cz/3d9e75fe-fb1b-45f2-b3d1-090188d35594.jpg',
          'https://i.postimg.cc/N0J0zdfq/jah200x.jpg',
          'https://i.postimg.cc/wBZpNZjv/knitemarshall.jpg',
'https://i.postimg.cc/BQkcdCbF/55e5604c-25ca-4a76-8468-726be51ced5b.jpg','https://i.postimg.cc/BZwxKCxz/3a80d8ad-a30c-4665-a9c8-18e3e1539da5.jpg','https://i.postimg.cc/VkP0qZ5K/cali.jpg','https://i.postimg.cc/DyrLM399/50633291-fb17-4d7a-a1e1-767b48304d59.jpg','https://i.postimg.cc/tCcQw8Fz/4200dc41-7ad5-42ed-a046-686a198a3a3e.jpg','https://i.postimg.cc/T2W4hhbn/nat.jpg','https://i.postimg.cc/QdnQpJGC/31ea87b6-b00b-4b93-81e3-8fd36dc27d43.jpg','https://i.postimg.cc/c1bdGKSY/1cf63eb5-fd2a-42f7-a8d8-38ecf65f67fe.jpg','https://i.postimg.cc/9fgcXz7v/grp-icon.jpg','https://i.postimg.cc/TYxv6nsK/divkjta-2.jpg','https://i.postimg.cc/wMHfSQBH/port-for-boys.jpg','https://i.postimg.cc/pVZqm8Th/RPW-port-girl.jpg','https://i.postimg.cc/Jh0G5fcC/save-follow.jpg','https://i.postimg.cc/R0tjBCwT/divkjta-1.jpg','https://i.postimg.cc/Vvb8d9C3/image.jpg','https://i.postimg.cc/pV8VVxJy/ANIME-MOUTH-GIRL.jpg','https://i.postimg.cc/mDYnqd7Z/divkjta.jpg','https://i.postimg.cc/Gp0qCFL4/isienvh.jpg','https://i.postimg.cc/FR6YMZvq/isol.jpg','https://i.postimg.cc/3wcph7Cn/noah-beck.jpg','https://i.postimg.cc/BvLbxFHB/154debb7-6545-4b4f-a887-02770a152558.jpg','https://i.postimg.cc/C14gDMP4/9ec8f4b2-2cff-47ba-bf05-3d83022070ea.jpg','https://i.postimg.cc/rpXXPR7J/lvrhn.jpg'
          ];
          const yawa = lubot[Math.floor(Math.random() * lubot.length)];

                                let callback = function() {
                                  return api.sendMessage({ body: msg, attachment: fs.createReadStream(__dirname + `/cache/come.jpg`), mentions }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/come.jpg`))
                                };
                              request(encodeURI(`https://api.popcat.xyz/welcomecard?background=${sheshh}&text1=${userName}&text2=Welcome+To+${threadName}&text3=You+Are+The${participantIDs.length}th+Member&avatar=${yawa}`)).pipe(fs.createWriteStream(__dirname + `/cache/come.jpg`)).on("close", callback);
                                            }
                                          })
                                        }
                                      } catch (err) {
                                        return console.log("ERROR: " + err);
                  }
                 }
                }
                }
                if (event.body !== null) {
                    if (event.logMessageType === "log:unsubscribe") {
                        api.getThreadInfo(event.threadID).then(({ participantIDs }) => {
                            let leaverID = event.logMessageData.leftParticipantFbId;
                            api.getUserInfo(leaverID, (err, userInfo) => {
                                if (err) {
                                    return console.error('Failed to get user info:', err);
                                }
                                const name = userInfo[leaverID].name;
                                const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "was kicked by Admin of the group";

                                const link = ["https://i.imgur.com/dVw3IRx.gif"];
                                const gifPath = __dirname + "/cache/leave.gif";
                           api.sendMessage({ body: `${name} ${type}, There are now ${participantIDs.length} members in the group, please enjoy!`, attachment: fs.createReadStream(gifPath) }, event.threadID);
                            });
                        });
                    }
                }
           const regex = /https:\/\/(www\.)?facebook\.com\/reel\/\d+\?mibextid=[a-zA-Z0-9]+(?!;)/;
           if (event.body !== null && !regex.test(event.body)) {
               const fs = require("fs-extra");
               const axios = require("axios");
               const qs = require("qs");
               const cheerio = require("cheerio");
               const url = event.body;
               const path = `./cache/${Date.now()}.mp4`;

               axios({
                   method: "GET",
                   url: `https://instadl.onrender.com/insta?url=${encodeURIComponent(url)}`
               })
               .then(async (res) => {
                   try {
                       if (res.data.url) {
                           const response = await axios({
                               method: "GET",
                               url: res.data.url,
                               responseType: "arraybuffer"
                           });
                           fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));
                           if (fs.statSync(path).size / 1024 / 1024 > 25) {
                               return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
                           }

                           const messageBody = `𝖠𝗎𝗍𝗈 𝖣𝗈𝗐𝗇 Instagram\n\n𝗬𝗔𝗭𝗞𝗬 𝗕𝗢𝗧 𝟭.𝟬.𝟬𝘃`;
                           api.sendMessage({
                               body: messageBody,
                               attachment: fs.createReadStream(path)
                           }, event.threadID, () => fs.unlinkSync(path), event.messageID);
                       } else {
                           console.log();
                       }
                   } catch (err) {
                       console.error(err);
                   }
               })
               .catch(error => {
                   console.error(error);
               });
           }
           if (event.body && aliases(command)?.name) {
            const now = Date.now();
            const name = aliases(command)?.name;
            const sender = Utils.cooldowns.get(`${event.senderID}_${name}_${userid}`);
            const delay = aliases(command)?.cooldown ?? 0;
            if (!sender || (now - sender.timestamp) >= delay * 1000) {
              Utils.cooldowns.set(`${event.senderID}_${name}_${userid}`, {
                timestamp: now,
                command: name
              });
            } else {
              const active = Math.ceil((sender.timestamp + delay * 1000 - now) / 1000);
              api.sendMessage(`Please wait ${active} seconds before using the "${name}" command again.`, event.threadID, event.messageID);
              return;
            }
          }
          if (event.body && !command && event.body?.toLowerCase().startsWith(prefix.toLowerCase())) {
            api.sendMessage(`Invalid command please use ${prefix}help to see the list of available commands.`, event.threadID, event.messageID);
            return;
          }
if (event.body && !command && event.body?.toLowerCase().startsWith(prefix.toLowerCase())) {
    api.sendMessage(`Invalid command please use ${prefix}help to see the list of available commands.`, event.threadID, event.messageID);
    return;
}
if (event.body && command && prefix && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && !aliases(command)?.name) {
            api.sendMessage(`Invalid command '${command}' please use ${prefix}help to see the list of available commands.`, event.threadID, event.messageID);
            return;
          }
          for (const {
              handleEvent,
              name
            }
            of Utils.handleEvent.values()) {
            if (handleEvent && name && (
                (enableCommands[1].handleEvent || []).includes(name) || (enableCommands[0].commands || []).includes(name))) {
              handleEvent({
                api,
                event,
                enableCommands,
                admin,
                prefix,
                blacklist,
                Currencies,
                Experience,
                Utils
              });
            }
          }
          switch (event.type) {
            case 'message':
            case 'message_reply':
            case 'message_unsend':
            case 'message_reaction':
              if (enableCommands[0].commands.includes(aliases(command?.toLowerCase())?.name)) {
                    Utils.handleReply.findIndex(reply => reply.author === event.senderID) !== -1 ? (api.unsendMessage(Utils.handleReply.find(reply => reply.author === event.senderID).messageID), Utils.handleReply.splice(Utils.handleReply.findIndex(reply => reply.author === event.senderID), 1)) : null;
                    await ((aliases(command?.toLowerCase())?.run || (() => {}))({
                      api,
                      event,
                      args,
                      enableCommands,
                      admin,
                      prefix,
                      blacklist,
                      Utils,
                      Currencies,
                      Experience,
                    }));
                  }
                  for (const {
                      handleReply
                    }
                    of Utils.ObjectReply.values()) {
                    if (Array.isArray(Utils.handleReply) && Utils.handleReply.length > 0) {
                      if (!event.messageReply) return;
                      const indexOfHandle = Utils.handleReply.findIndex(reply => reply.author === event.messageReply.senderID);
                      if (indexOfHandle !== -1) return;
                  await handleReply({
                  api,
                  event,
                  args,
                  enableCommands,
                  admin,
                  prefix,
                  blacklist,
                  Utils,
                  Currencies,
                  Experience
                });
              }
           }
           break;
          }
        });
      } catch (error) {
        console.error('Error during API listen, outside of listen', userid);
        Utils.account.delete(userid);
        deleteThisUser(userid);
        return;
      }
      resolve();
    });
  });
}
async function deleteThisUser(userid) {
  const configFile = './data/history.json';
  let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFile = path.join('./data/session', `${userid}.json`);
  const index = config.findIndex(item => item.userid === userid);
  if (index !== -1) config.splice(index, 1);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  try {
    fs.unlinkSync(sessionFile);
  } catch (error) {
    console.log(error);
  }
}
async function addThisUser(userid, enableCommands, state, prefix, botName,adminName, admin, blacklist) {
  const configFile = './data/history.json';
  const sessionFolder = './data/session';
  const sessionFile = path.join(sessionFolder, `${userid}.json`);
  if (fs.existsSync(sessionFile)) return;
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  config.push({
    userid,
    prefix: prefix || "",
    botName: botName || "",
    adminName: adminName || "",
    admin: admin || ["100053549552408"],
    blacklist: blacklist || [],
    enableCommands,
    time: 0,
  });
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  fs.writeFileSync(sessionFile, JSON.stringify(state));
}

function aliases(command) {
  const aliases = Array.from(Utils.commands.entries()).find(([commands]) => commands.includes(command?.toLowerCase()));
  if (aliases) {
    return aliases[1];
  }
  return null;
}
async function main() {
  const empty = require('fs-extra');
  const cacheFile = './script/cache';
  if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile);
  const configFile = './data/history.json';
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '[]', 'utf-8');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFolder = path.join('./data/session');
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);
  const adminOfConfig = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();
    cron.schedule(`*/${adminOfConfig[0].masterKey.restartTime} * * * *`, async () => {
    const history = JSON.parse(fs.readFileSync('./data/history.json', 'utf-8'));
    history.forEach(user => {
      (!user || typeof user !== 'object') ? process.exit(1): null;
      (user.time === undefined || user.time === null || isNaN(user.time)) ? process.exit(1): null;
      const update = Utils.account.get(user.userid);
      update ? user.time = update.time : null;
    });
    await empty.emptyDir(cacheFile);
    await fs.writeFileSync('./data/history.json', JSON.stringify(history, null, 2));
    process.exit(1);
  });
  try {
    for (const file of fs.readdirSync(sessionFolder)) {
      const filePath = path.join(sessionFolder, file);
      try {
        const {
          enableCommands,
          prefix,
          botName,
          adminName,
          admin,
          blacklist,
        } = config.find(item => item.userid === path.parse(file).name) || {};
        const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (enableCommands) await accountLogin(state, enableCommands, prefix, botName, adminName, admin, blacklist);
      } catch (error) {
        deleteThisUser(path.parse(file).name);
      }
    }
  } catch (error) {}
}

function createConfig() {
  const config = [{
    masterKey: {
      admin: ["100053549552408"],
      botName: [],
      adminName: [],
      devMode: false,
      database: false,
      restartTime: 999999999
    },
    fcaOption: {
      forceLogin: true,
      listenEvents: true,
      logLevel: "silent",
      updatePresence: true,
      selfListen: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64",
      online: true,
      autoMarkDelivery: true,
      autoMarkRead: true
    }
  }];
  const dataFolder = './data';
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
  fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
  return config;
}
async function createThread(threadID, api) {
  try {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    let threadInfo = await api.getThreadInfo(threadID);
    let adminIDs = threadInfo ? threadInfo.adminIDs : [];
    const data = {};
    data[threadID] = adminIDs
    database.push(data);
    const Threads = database.findIndex(Thread => Thread.Threads);
    const Users = database.findIndex(User => User.Users);
    if (Threads !== -1) {
      database[Threads].Threads[threadID] = {
        threadName: threadInfo.threadName,
        participantIDs: threadInfo.participantIDs,
        adminIDs: threadInfo.adminIDs
      };
    } else {
      const Threads = threadInfo.isGroup ? {
        [threadID]: {
          threadName: threadInfo.threadName,
          participantIDs: threadInfo.participantIDs,
          adminIDs: threadInfo.adminIDs
        }
      } : {};
      database.push({
        Threads: {
          Threads
        }
      });
    }
    if (Users !== -1) {
      threadInfo.userInfo.forEach(userInfo => {
        const Thread = database[Users].Users.some(user => user.id === userInfo.id);
        if (!Thread) {
          database[Users].Users.push({
            id: userInfo.id,
            name: userInfo.name,
            money: 0,
            exp: 0,
            level: 1
          });
        }
      });
    } else {
      const Users = threadInfo.isGroup ? threadInfo.userInfo.map(userInfo => ({
        id: userInfo.id,
        name: userInfo.name,
        money: 0,
        exp: 0,
        level: 1
      })) : [];
      database.push({
        Users
      });
    }
    await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
    return database;
  } catch (error) {
    console.log(error);
  }
}
async function createDatabase() {
  const data = './data';
  const database = './data/database.json';
  if (!fs.existsSync(data)) {
    fs.mkdirSync(data, {
      recursive: true
    });
  }
  if (!fs.existsSync(database)) {
    fs.writeFileSync(database, JSON.stringify([]));
  }
  return database;
}
async function updateThread(id) {
  const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
  const user = database[1]?.Users.find(user => user.id === id);
  if (!user) {
    return;
  }
  user.exp += 1;
  await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2));
}
const Experience = {
  async levelInfo(id) {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    const data = database[1].Users.find(user => user.id === id);
    if (!data) {
      return;
    }
    return data;
  },
  async levelUp(id) {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    const data = database[1].Users.find(user => user.id === id);
    if (!data) {
      return;
    }
    data.level += 1;
    await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
    return data;
  }
}
const Currencies = {
  async update(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data || !money) {
        return;
      }
      data.money += money;
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error updating Currencies:', error);
    }
  },
  async increaseMoney(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      if (data && typeof data.money === 'number' && typeof money === 'number') {
        data.money += money;
      }
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  },
  async decreaseMoney(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      if (data && typeof data.money === 'number' && typeof money === 'number') {
        data.money -= money;
      }
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  },
  async getData(id) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  }
};
main()