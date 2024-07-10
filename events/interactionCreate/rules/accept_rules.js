const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "accept_rules") return;

  try {
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle(
        "Rules Accepted / Regeln akzeptiert / Règles acceptées / Reglas aceptadas"
      )
      .setDescription(
        "🇩🇪 Du hast erfolgreich die Regeln akzeptiert. Du kannst jetzt deinen Spielmodus im nächsten Channel auswählen.\n\n" +
          "🇬🇧 You have successfully accepted the rules. You can now select your game mode in the next channel.\n\n" +
          "🇫🇷 Vous avez accepté les règles avec succès. Vous pouvez maintenant sélectionner votre mode de jeu dans le prochain canal.\n\n" +
          "🇪🇸 Has aceptado las reglas con éxito. Ahora puedes seleccionar tu modo de juego en el siguiente canal."
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

    const member = interaction.member;
    const role = interaction.guild.roles.cache.get("1188598586544504843");
    if (role) await member.roles.add(role);
  } catch (error) {
    console.error("Error processing rule acceptance:", error);
    await interaction.reply({
      content:
        "There was an error processing your rule acceptance. Please try again or contact an administrator.",
      ephemeral: true,
    });
  }
};
