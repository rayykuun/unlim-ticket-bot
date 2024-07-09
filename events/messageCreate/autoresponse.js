const { AutoResponse } = require("../../mongoSchema");

module.exports = async (message, client) => {
  // Ignoriere Nachrichten von Bots
  if (message.author.bot) return;

  try {
    // Hole alle AutoResponses für diesen Server
    const autoResponses = await AutoResponse.find({
      guildId: message.guild.id,
    });

    // Überprüfe jede AutoResponse
    for (const autoResponse of autoResponses) {
      // Prüfe, ob der Trigger in der Nachricht enthalten ist (case-insensitive)
      if (
        message.content
          .toLowerCase()
          .includes(autoResponse.trigger.toLowerCase())
      ) {
        // Sende die Antwort
        await message.channel.send(autoResponse.response);

        // Optional: Breche nach der ersten gefundenen Antwort ab
        // Entfernen Sie diesen break, wenn mehrere Antworten möglich sein sollen
        break;
      }
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Auto-Antwort:", error);
  }
};
