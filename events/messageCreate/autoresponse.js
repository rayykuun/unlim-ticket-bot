const { AutoResponse, UserResponse } = require("../../mongoSchema");

module.exports = async (message, client) => {
  // Ignoriere Nachrichten von Bots
  if (message.author.bot) return;

  // Stelle sicher, dass die Nachricht in einem Server (Guild) gesendet wurde
  if (!message.guild) return;

  try {
    // Überprüfe zuerst auf benutzerspezifische Antworten
    const userResponse = await UserResponse.findOne({
      guildId: message.guild.id,
      userId: message.author.id,
    });

    if (userResponse) {
      await message.reply(userResponse.response);
      return;
    }

    // Dann überprüfe auf allgemeine Auto-Antworten
    const content = message.content.toLowerCase();
    const autoResponses = await AutoResponse.find({
      guildId: message.guild.id,
    });

    for (const response of autoResponses) {
      if (content.includes(response.trigger.toLowerCase())) {
        await message.reply(response.response);
        break;
      }
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Auto-Antwort:", error);
  }
};
