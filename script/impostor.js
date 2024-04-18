module.exports.config = {
    name: "impostor",
    version: "1.0.9",
    role: 2,
    credits: "cliff",
    description: "Randomly kicks a member",
    usage: "{p}{n} impostor",
    hasPrefix: false,
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length === 0) {
        api.sendMessage("No members other than the bot found!", event.threadID);
        return;
    }

    const randomIndex = Math.floor(Math.random() * members.length);
    const memberID = members[randomIndex];

    try {
        await api.removeUserFromGroup(memberID, event.threadID);
        api.sendMessage(`Member ${memberID} has been kicked!`, event.threadID);
    } catch (error) {
        api.sendMessage(`Make me an admin first,Failed to kick member ${memberID}. Error: ${error}`, event.threadID);
    }
};
