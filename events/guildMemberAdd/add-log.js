const { EmbedBuilder } = require("discord.js");
const { LogChannel, MemberLog } = require("../../mongoSchema");

module.exports = async (member, client) => {
  try {
    // Suche nach dem Log-Kanal für den Server
    const logChannel = await LogChannel.findOne({ guildId: member.guild.id });

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Mitglied beigetreten")
        .addFields(
          { name: "Name", value: member.user.tag },
          { name: "ID", value: member.id },
          {
            name: "Discord beigetreten",
            value: member.user.createdAt.toLocaleString(),
          }
        )
        .setTimestamp();

      const channel = member.guild.channels.cache.get(logChannel.channelId);
      if (channel) {
        channel.send({ embeds: [embed] });
      }
    }

    // Suche nach einem existierenden Eintrag für den Benutzer in der Datenbank
    let memberLog = await MemberLog.findOne({ userId: member.id });

    if (!memberLog) {
      // Erstelle einen neuen Eintrag, wenn noch keiner existiert
      memberLog = new MemberLog({
        userId: member.id,
        username: member.user.tag,
        discordJoined: member.user.createdAt,
        serverJoins: [
          {
            guildId: member.guild.id,
            joinedAt: new Date(),
          },
        ],
        serverLeaves: [],
      });
    } else {
      // Füge den Server-Beitritt zur Liste hinzu, wenn der Eintrag bereits existiert
      memberLog.serverJoins.push({
        guildId: member.guild.id,
        joinedAt: new Date(),
      });
    }

    // Speichere den aktualisierten Eintrag in der Datenbank
    await memberLog.save();
  } catch (error) {
    console.error("Fehler beim Protokollieren des Mitglied-Beitritts:", error);
  }
};
