const { EmbedBuilder } = require("discord.js");

module.exports = (c, client, handler) => {
  const guildsCount = client.guilds.cache.size;
  const usersCount = client.users.cache.size;
  const channelsCount = client.channels.cache.size;

  const statusMessage =
    `Bot ${c.user.tag} ist jetzt online!\n\n` +
    `Verbunden mit ${guildsCount} Servern.\n` +
    `Erreichbar für ${usersCount} Benutzer.\n` +
    `Zugriff auf ${channelsCount} Kanäle.`;

  console.log(statusMessage);

  const channelId = "1257383155745296384"; // Ersetze dies durch die ID des Kanals, in den die Nachricht gesendet werden soll

  const channel = client.channels.cache.get(channelId);
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Bot ist online")
      .setDescription(statusMessage)
      .setTimestamp()
      .setFooter({ text: "dev: rayy" });

    channel.send({ embeds: [embed] });
  } else {
    console.error(`Kanal mit der ID ${channelId} nicht gefunden.`);
  }
};
