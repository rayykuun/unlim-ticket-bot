const { EmbedBuilder } = require("discord.js");
const { LogChannel, MemberUpdateLog } = require("../../mongoSchema");

module.exports = async (oldMember, newMember, client) => {
  try {
    // Überprüfe, ob sich der Nickname oder die Rollen des Mitglieds geändert haben
    if (
      oldMember.nickname !== newMember.nickname ||
      !oldMember.roles.cache.equals(newMember.roles.cache)
    ) {
      // Suche nach dem Log-Kanal für den Server
      const logChannel = await LogChannel.findOne({
        guildId: newMember.guild.id,
      });

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle("Mitglied aktualisiert")
          .addFields(
            { name: "Mitglied", value: newMember.toString() },
            {
              name: "Alter Nickname",
              value: oldMember.nickname || "Kein Nickname",
            },
            {
              name: "Neuer Nickname",
              value: newMember.nickname || "Kein Nickname",
            },
            {
              name: "Alte Rollen",
              value:
                oldMember.roles.cache
                  .map((role) => role.toString())
                  .join(", ") || "Keine Rollen",
            },
            {
              name: "Neue Rollen",
              value:
                newMember.roles.cache
                  .map((role) => role.toString())
                  .join(", ") || "Keine Rollen",
            }
          )
          .setTimestamp();

        const channel = newMember.guild.channels.cache.get(
          logChannel.channelId
        );
        if (channel) {
          channel.send({ embeds: [embed] });
        }
      }

      // Erstelle einen neuen Eintrag in der Datenbank
      const memberUpdateLog = new MemberUpdateLog({
        guildId: newMember.guild.id,
        userId: newMember.id,
        oldNickname: oldMember.nickname,
        newNickname: newMember.nickname,
        oldRoles: oldMember.roles.cache.map((role) => role.id),
        newRoles: newMember.roles.cache.map((role) => role.id),
        timestamp: new Date(),
      });

      // Speichere den Eintrag in der Datenbank
      await memberUpdateLog.save();
    }
  } catch (error) {
    console.error(
      "Fehler beim Protokollieren der Mitglied-Aktualisierung:",
      error
    );
  }
};
