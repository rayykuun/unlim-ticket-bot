const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Moderator = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-moderator")
    .setDescription("Entfernt einen Moderator aus der Datenbank.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der als Moderator entfernt werden soll.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  run: async ({ interaction, client, handler }) => {
    const user = interaction.options.getUser("user");

    try {
      const existingModerator = await Moderator.findOne({ userId: user.id });
      if (!existingModerator) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Moderator nicht gefunden")
          .setDescription(`${user.username} ist kein Moderator.`);

        return interaction.reply({ embeds: [embed] });
      }

      await Moderator.deleteOne({ userId: user.id });

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Moderator entfernt")
        .setDescription(
          `${user.username} wurde erfolgreich als Moderator entfernt.`
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Entfernen des Moderators:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Entfernen des Moderators aufgetreten."
        );

      interaction.reply({ embeds: [embed] });
    }
  },
};
