const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { UserResponse, Moderator } = require("../../mongoSchema");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("add-user-response")
    .setDescription("Fügt eine neue Benutzer-spezifische Antwort hinzu")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, für den die Antwort gilt")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("response")
        .setDescription(
          "Die Antwort, die für diesen Benutzer gesendet werden soll"
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  run: async ({ interaction, client, handler }) => {
    try {
      // Überprüfen, ob der Benutzer ein Moderator ist
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });
      if (!moderator) {
        return interaction.reply({
          content: "Du hast keine Berechtigung, diesen Befehl zu verwenden.",
          ephemeral: true,
        });
      }

      const targetUser = interaction.options.getUser("user");
      const response = interaction.options.getString("response");

      // Überprüfen, ob bereits eine Benutzer-Antwort für diesen Benutzer existiert
      const existingUserResponse = await UserResponse.findOne({
        guildId: interaction.guildId,
        userId: targetUser.id,
      });

      if (existingUserResponse) {
        return interaction.reply({
          content: "Es existiert bereits eine Antwort für diesen Benutzer.",
          ephemeral: true,
        });
      }

      // Neue Benutzer-Antwort erstellen und speichern
      const newUserResponse = new UserResponse({
        guildId: interaction.guildId,
        userId: targetUser.id,
        response: response,
        createdBy: interaction.user.id,
      });

      await newUserResponse.save();

      // Erfolgreiche Antwort senden
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Benutzer-spezifische Antwort hinzugefügt")
        .addFields(
          { name: "Benutzer", value: targetUser.tag },
          { name: "Antwort", value: response }
        )
        .setFooter({ text: `Hinzugefügt von ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Benutzer-Antwort:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },
};
