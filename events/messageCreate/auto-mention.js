const { UserResponse, Moderator } = require("../../mongoSchema");

module.exports = async (message, client) => {
  // Ignoriere Nachrichten von Bots
  if (message.author.bot) return;

  // Überprüfe, ob der Autor ein Moderator ist
  // const isModerator = await Moderator.findOne({ userId: message.author.id });
  // if (isModerator) return; // Ignoriere Nachrichten von Moderatoren

  // Überprüfe, ob die Nachricht Benutzer-Erwähnungen enthält
  const mentionedUsers = message.mentions.users;
  if (mentionedUsers.size === 0) return; // Keine Erwähnungen, nichts zu tun

  try {
    for (const [userId, user] of mentionedUsers) {
      // Hole die UserResponse für diesen Server und Benutzer
      const userResponse = await UserResponse.findOne({
        guildId: message.guild.id,
        userId: userId,
      });

      if (userResponse) {
        // Lösche die ursprüngliche Nachricht
        await message.delete();

        // Sende die automatische Antwort
        await message.channel.send(userResponse.response);

        // Optional: Sende eine Warnung an den Autor
        //    await message.channel.send(
        //     `${message.author}, bitte erwähne ${user.username} nicht.`
        //   );

        // Breche nach der ersten gefundenen Antwort ab
        // Entfernen Sie diesen break, wenn mehrere Antworten möglich sein sollen
        break;
      }
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Benutzer-Erwähnung:", error);
  }
};
