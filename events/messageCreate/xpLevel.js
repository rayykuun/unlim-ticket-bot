const { UserXP, LevelReward } = require("../../mongoSchema");

module.exports = async (message, client) => {
  if (message.author.bot) return;

  try {
    let userXP = await UserXP.findOne({ userId: message.author.id });

    if (!userXP) {
      userXP = new UserXP({
        userId: message.author.id,
        xp: 0,
        level: 0,
      });
    }

    // Füge 20 XP für jede Nachricht hinzu
    userXP.xp += 20;

    // Berechne das erforderliche XP für das nächste Level (250 XP pro Level)
    const requiredXP = 250;

    // Überprüfe, ob der Benutzer ein neues Level erreicht hat
    while (userXP.xp >= requiredXP) {
      userXP.level++;
      userXP.xp -= requiredXP;

      // Sende eine Levelup-Nachricht
      message.channel.send(
        `Glückwunsch, ${message.author}! Du bist jetzt Level ${userXP.level}!`
      );

      // Überprüfe auf Belohnungen für das neue Level
      const reward = await LevelReward.findOne({
        guildId: message.guild.id,
        level: userXP.level,
      });

      if (reward) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) {
          await message.member.roles.add(role);
          message.channel.send(
            `Du hast die Rolle ${role.name} für das Erreichen von Level ${userXP.level} erhalten!`
          );
        }
      }
    }

    await userXP.save();
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Benutzer-XP:", error);
  }
};
