const { MemberLog } = require("../../mongoSchema");

module.exports = async (member, client) => {
  try {
    // Suche nach einem existierenden Eintrag für den Benutzer in der Datenbank
    const memberLog = await MemberLog.findOne({ userId: member.id });

    if (memberLog) {
      // Füge den Server-Verlassen-Eintrag zur Liste hinzu
      memberLog.serverLeaves.push({
        guildId: member.guild.id,
        leftAt: new Date(),
      });

      // Speichere den aktualisierten Eintrag in der Datenbank
      await memberLog.save();
    }
  } catch (error) {
    console.error("Fehler beim Protokollieren des Mitglied-Verlassens:", error);
  }
};
