const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { WarnLog, UserXP } = require("../../mongoSchema");

module.exports = async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== "userinfo")
    return;

  const embedTitle = interaction.message.embeds[0].title;
  const match = embedTitle.match(/für (.+)$/);
  if (!match) {
    console.error("Konnte Benutzernamen nicht aus dem Embed-Titel extrahieren");
    return await interaction.reply({
      content: "Es ist ein Fehler aufgetreten.",
      ephemeral: true,
    });
  }
  const username = match[1];

  const user = interaction.guild.members.cache.find(
    (member) => member.user.tag === username
  )?.user;
  if (!user) {
    console.error("Konnte Benutzer nicht finden:", username);
    return await interaction.reply({
      content: "Benutzer konnte nicht gefunden werden.",
      ephemeral: true,
    });
  }

  if (interaction.values[0] === "xp") {
    try {
      const userXP = await UserXP.findOne({ userId: user.id });

      if (!userXP) {
        return await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFA500")
              .setTitle(`XP & Level für ${user.tag}`)
              .setDescription("Dieser Benutzer hat noch keine XP gesammelt.")
              .setThumbnail(user.displayAvatarURL({ dynamic: true })),
          ],
          components: [interaction.message.components[0]],
        });
      }

      const currentXP = userXP.xp;
      const currentLevel = userXP.level;
      const xpForNextLevel = calculateXPForNextLevel(currentLevel);
      const xpProgress = currentXP - calculateTotalXPForLevel(currentLevel);

      // Calculate user's rank
      const allUsers = await UserXP.find().sort({ level: -1, xp: -1 });
      const userRank = allUsers.findIndex((u) => u.userId === user.id) + 1;

      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle(`XP & Level für ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "Level", value: currentLevel.toString(), inline: true },
          { name: "Rang", value: `#${userRank}`, inline: true },
          {
            name: "XP",
            value: `${xpProgress} / ${xpForNextLevel}`,
            inline: true,
          },
          {
            name: "Fortschritt zum nächsten Level",
            value: generateProgressBar(xpProgress, xpForNextLevel),
          }
        );

      await interaction.update({
        embeds: [embed],
        components: [interaction.message.components[0]],
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der XP-Informationen:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler beim Abrufen der XP-Informationen aufgetreten.",
        ephemeral: true,
      });
    }
  }
};

function calculateXPForNextLevel(level) {
  return 100 * (level + 1);
}

function calculateTotalXPForLevel(level) {
  let totalXP = 0;
  for (let i = 0; i < level; i++) {
    totalXP += calculateXPForNextLevel(i);
  }
  return totalXP;
}

function generateProgressBar(current, max, length = 20) {
  const percentage = Math.max(0, Math.min(1, current / max));
  const progress = Math.round(length * percentage);
  const emptyProgress = length - progress;
  const progressText = "▇".repeat(Math.max(0, progress));
  const emptyProgressText = "—".repeat(Math.max(0, emptyProgress));
  const percentageText = Math.round(percentage * 100) + "%";

  return `[${progressText}${emptyProgressText}] ${percentageText}`;
}
