const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { LogChannel, MessageLog } = require("../../mongoSchema");

module.exports = async (oldMessage, newMessage, client) => {
  if (!oldMessage || !newMessage) return;
  // Ignoriere Nachrichten von Bots
  if (oldMessage.author.bot) return;

  // Überprüfe, ob sich der Inhalt der Nachricht geändert hat
  if (oldMessage.content === newMessage.content) return;

  try {
    // Suche nach dem Log-Kanal für den Server
    const logChannel = await LogChannel.findOne({
      guildId: oldMessage.guild.id,
    });

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Nachricht aktualisiert")
        .addFields(
          { name: "Autor", value: oldMessage.author.tag },
          { name: "Kanal", value: oldMessage.channel.toString() },
          { name: "Alte Nachricht", value: oldMessage.content },
          { name: "Neue Nachricht", value: newMessage.content }
        )
        .setTimestamp();

      // Erstelle einen Button, der zur bearbeiteten Nachricht springt
      const jumpButton = new ButtonBuilder()
        .setLabel("Zur Nachricht springen")
        .setStyle(ButtonStyle.Link)
        .setURL(newMessage.url);

      const row = new ActionRowBuilder().addComponents(jumpButton);

      const channel = oldMessage.guild.channels.cache.get(logChannel.channelId);
      if (channel) {
        channel.send({ embeds: [embed], components: [row] });
      }
    }

    // Erstelle einen neuen Eintrag in der Datenbank
    const messageLog = new MessageLog({
      guildId: oldMessage.guild.id,
      userId: oldMessage.author.id,
      channelId: oldMessage.channel.id,
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      timestamp: new Date(),
    });

    // Speichere den Eintrag in der Datenbank
    await messageLog.save();
  } catch (error) {
    console.error(
      "Fehler beim Protokollieren der aktualisierten Nachricht:",
      error
    );
  }
};
