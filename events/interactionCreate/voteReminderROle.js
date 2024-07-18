const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "vote_reminder") return;

  const roleId = "1225463737817894985"; // Ersetzen Sie dies mit der tatsächlichen Rollen-ID
  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) {
    return interaction.reply({
      content: "Die Vote-Reminder-Rolle konnte nicht gefunden werden.",
      ephemeral: true,
    });
  }

  const member = interaction.member;

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(role);
    await interaction.reply({
      content: "Du wirst nun nicht mehr an das Voten erinnert.",
      ephemeral: true,
    });
  } else {
    await member.roles.add(role);
    await interaction.reply({
      content:
        "Du wirst nun an das Voten erinnert!\n\n wenn du das nichtmehr möchtest klicke auf den Button **ERINNER MICH** um die Erinnerung zu entfernen.",
      ephemeral: true,
    });
  }
};
