const { EmbedBuilder } = require("discord.js");
const { LogChannel, MemberLog } = require("../../mongoSchema");

module.exports = async (member, client, handler) => {
  console.log("member joined event triggered");
  try {
    // Log-Kanal finden
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
        await channel.send({ embeds: [embed] });
      }
    }

    // MemberLog in der Datenbank aktualisieren oder erstellen
    let memberLog = await MemberLog.findOne({ userId: member.id });

    if (!memberLog) {
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
      memberLog.serverJoins.push({
        guildId: member.guild.id,
        joinedAt: new Date(),
      });
    }

    await memberLog.save();

    console.log(`Mitglied ${member.user.tag} wurde erfolgreich geloggt.`);
  } catch (error) {
    console.error("Fehler beim Protokollieren des Mitglied-Beitritts:", error);
  }
};
