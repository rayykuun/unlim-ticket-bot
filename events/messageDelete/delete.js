const { EmbedBuilder } = require("discord.js");
const { LogChannel, DeletedMessageLog } = require("../../mongoSchema");

module.exports = async (message, client) => {
  // Ignoriere Nachrichten von Bots
  if (message.author.bot) return;

  try {
    // Suche nach dem Log-Kanal für den Server
    const logChannel = await LogChannel.findOne({ guildId: message.guild.id });

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Nachricht gelöscht")
        .addFields(
          { name: "Autor", value: message.author.tag },
          { name: "Kanal", value: message.channel.toString() },
          { name: "Nachricht", value: message.content }
        )
        .setTimestamp();

      const channel = message.guild.channels.cache.get(logChannel.channelId);
      if (channel) {
        channel.send({ embeds: [embed] });
      }
    }

    // Erstelle einen neuen Eintrag in der Datenbank
    const deletedMessageLog = new DeletedMessageLog({
      guildId: message.guild.id,
      userId: message.author.id,
      channelId: message.channel.id,
      content: message.content,
      timestamp: new Date(),
    });

    // Speichere den Eintrag in der Datenbank
    await deletedMessageLog.save();
  } catch (error) {
    console.error(
      "Fehler beim Protokollieren der gelöschten Nachricht:",
      error
    );
  }
};
