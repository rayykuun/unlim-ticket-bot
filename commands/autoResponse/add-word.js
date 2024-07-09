const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { AutoResponse, Moderator } = require("../../mongoSchema");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("add-autoresponse")
    .setDescription("Fügt eine neue automatische Antwort hinzu")
    .addStringOption((option) =>
      option
        .setName("trigger")
        .setDescription("Das Wort oder der Satz, der die Antwort auslöst")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("response")
        .setDescription("Die Antwort, die gesendet werden soll")
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

      const trigger = interaction.options.getString("trigger");
      const response = interaction.options.getString("response");

      // Überprüfen, ob bereits eine Auto-Antwort mit diesem Trigger existiert
      const existingAutoResponse = await AutoResponse.findOne({
        guildId: interaction.guildId,
        trigger: trigger,
      });

      if (existingAutoResponse) {
        return interaction.reply({
          content:
            "Es existiert bereits eine automatische Antwort für diesen Trigger.",
          ephemeral: true,
        });
      }

      // Neue Auto-Antwort erstellen und speichern
      const newAutoResponse = new AutoResponse({
        guildId: interaction.guildId,
        trigger: trigger,
        response: response,
        createdBy: interaction.user.id,
      });

      await newAutoResponse.save();

      // Erfolgreiche Antwort senden
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Automatische Antwort hinzugefügt")
        .addFields(
          { name: "Trigger", value: trigger },
          { name: "Antwort", value: response }
        )
        .setFooter({ text: `Hinzugefügt von ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Hinzufügen der automatischen Antwort:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },
};
