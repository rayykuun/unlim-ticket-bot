const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-moderator")
    .setDescription("Fügt einen Moderator zur Datenbank hinzu.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "Der Benutzer, der als Moderator hinzugefügt werden soll."
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  run: async ({ interaction, client, handler }) => {
    const user = interaction.options.getUser("user");

    try {
      const existingModerator = await Moderator.findOne({ userId: user.id });
      if (existingModerator) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Moderator bereits vorhanden")
          .setDescription(`${user.username} ist bereits ein Moderator.`);

        return interaction.reply({ embeds: [embed] });
      }

      const newModerator = new Moderator({
        userId: user.id,
        username: user.username,
      });

      await newModerator.save();

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Moderator hinzugefügt")
        .setDescription(
          `${user.username} wurde erfolgreich als Moderator hinzugefügt.`
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Moderators:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Hinzufügen des Moderators aufgetreten."
        );

      interaction.reply({ embeds: [embed] });
    }
  },
};
