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

    userXP.xp += 20;

    const requiredXP = Math.floor(100 * Math.pow(1.7, userXP.level));

    if (userXP.xp >= requiredXP) {
      userXP.level++;
      userXP.xp = 0; // Setze XP auf 0 anstatt den Überschuss zu berechnen

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
