const fs = require("fs");
const path = require("path");

const historyFilePath = path.resolve(__dirname, '..', 'data', 'history.json');

let historyData = [];

try {
  historyData = require(historyFilePath);
} catch (readError) {
  console.error('Error reading history.json:', readError);
}

module.exports.config = {
  name: 'cmds',
  aliases: ['cmdconfig', 'ec'],
  description: 'activate or deactivate bot command according to its name',
  usages: ["activate/deactivate [name] - [uid optional]", "cmds list [page optional] or list all"],
  version: '1.2.0', 
  role: 2,
  hasPrefix: true,
  cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const botID = api.getCurrentUserID();

  const [action, commandNameUid] = args;
  const [commandName, uid] = commandNameUid.split('|').map(str => str.trim());

  const botIndex = uid ? historyData.findIndex(user => user.userid === uid) : historyData.findIndex(user => user.userid === botID);

  if (botIndex === -1) {
    api.sendMessage('Bot user not found in the history configuration.', threadID, messageID);
    return;
  }

  const botUser = historyData[botIndex];

  switch (action) {
    case 'activate':
      if (!botUser.enableCommands) {
        botUser.enableCommands = [{ commands: [commandName] }];
      } else {
        const existingCommands = botUser.enableCommands[0].commands;
        if (!existingCommands.includes(commandName)) {
          existingCommands.push(commandName);
        } else {
          api.sendMessage(`Command "${commandName}" is already activated.`, threadID, messageID);
          return;
        }
      }
      break;

    case 'deactivate':
      if (botUser.enableCommands && botUser.enableCommands[0].commands.includes(commandName)) {
        botUser.enableCommands[0].commands = botUser.enableCommands[0].commands.filter(cmd => cmd !== commandName);
      } else {
        api.sendMessage(`Command "${commandName}" is not currently activated.`, threadID, messageID);
        return;
      }
      break;

    case 'list':
      if (!botUser.enableCommands || botUser.enableCommands.length === 0) {
        api.sendMessage('No commands are currently activated.', threadID, messageID);
        return;
      }

      const allCommands = botUser.enableCommands[0].commands;

      if (commandName === 'all') {
        api.sendMessage(`All Activated Commands:\n${allCommands.join(', ')}`, threadID, messageID);
        return;
      } else {
        // Existing code for pagination
      }
      break;

    default:
      api.sendMessage('Invalid action. Use "activate/deactivate [name] | [uid optional]" or "list [page optional] or list all".', threadID, messageID);
      return;
  }

  await updateHistoryFile();
  api.sendMessage(`Command "${commandName}" ${action === 'activate' ? 'activated' : 'deactivated'} successfully.`, threadID, messageID);

  async function updateHistoryFile() {
    try {
      await fs.promises.writeFile(historyFilePath, JSON.stringify(historyData, (key, value) => {
        if (key === "commands" && Array.isArray(value)) {
          return value;
        } else {
          return value;
        }
      }, 2));
    } catch (writeError) {
      console.error('Error writing to history.json:', writeError);
    }
  }
};