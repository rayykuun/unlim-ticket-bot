const { UserXP, LevelReward } = require("../../mongoSchema");
const { EmbedBuilder } = require("discord.js");

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

    const xpGain = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
    userXP.xp += xpGain;

    if (userXP.xp >= 250) {
      userXP.level++;
      userXP.xp = 0;

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Level Up!")
        .setDescription(
          `Glückwunsch, ${message.author}! Du bist jetzt Level ${userXP.level}!`
        )
        .setThumbnail(message.author.displayAvatarURL());

      const reward = await LevelReward.findOne({
        guildId: message.guild.id,
        level: userXP.level,
      });

      if (reward) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (role) {
          await message.member.roles.add(role);
          embed.addFields({
            name: "Rollenbelohnung",
            value: `Du hast die Rolle ${role.name} erhalten!`,
          });
        }
      }

      message.channel.send({ embeds: [embed] });
    }

    await userXP.save();
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Benutzer-XP:", error);
  }
};
