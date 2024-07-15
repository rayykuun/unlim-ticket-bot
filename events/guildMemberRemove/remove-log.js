const { EmbedBuilder } = require("discord.js");
const { MemberLog, LogChannel } = require("../../mongoSchema");

module.exports = async (member, client) => {
  console.log("member left event triggered");
  try {
    // Existing code for updating MemberLog
    const memberLog = await MemberLog.findOne({ userId: member.id });

    if (memberLog) {
      memberLog.serverLeaves.push({
        guildId: member.guild.id,
        leftAt: new Date(),
      });

      await memberLog.save();
    }

    // New code for sending log message
    const logChannel = await LogChannel.findOne({ guildId: member.guild.id });

    if (logChannel) {
      const channel = member.guild.channels.cache.get(logChannel.channelId);

      if (channel) {
        const joinDate = memberLog
          ? memberLog.serverJoins.find(
              (join) => join.guildId === member.guild.id
            )?.joinedAt
          : member.joinedAt;
        const leaveDate = new Date();
        const totalTime = leaveDate - joinDate;
        const days = Math.floor(totalTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (totalTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (totalTime % (1000 * 60 * 60)) / (1000 * 60)
        );

        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Mitglied hat den Server verlassen")
          .addFields(
            { name: "ID", value: member.id },
            { name: "Name", value: member.user.tag },
            { name: "Beigetreten am", value: joinDate.toLocaleString() },
            { name: "Verlassen am", value: leaveDate.toLocaleString() },
            {
              name: "Gesamtzeit auf dem Server",
              value: `${days} Tage, ${hours} Stunden, ${minutes} Minuten`,
            }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error("Fehler beim Protokollieren des Mitglied-Verlassens:", error);
  }
};
