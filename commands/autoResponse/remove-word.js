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
    .setName("remove-word")
    .setDescription("Entfernt eine automatische Antwort")
    .addStringOption((option) =>
      option
        .setName("trigger")
        .setDescription("Das Wort oder der Satz, der entfernt werden soll")
        .setRequired(true)
        .setAutocomplete(true)
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

      // Suche nach der AutoResponse
      const autoResponse = await AutoResponse.findOne({
        guildId: interaction.guildId,
        trigger: trigger,
      });

      if (!autoResponse) {
        return interaction.reply({
          content:
            "Es wurde keine automatische Antwort für diesen Trigger gefunden.",
          ephemeral: true,
        });
      }

      // Lösche die AutoResponse
      await AutoResponse.deleteOne({
        guildId: interaction.guildId,
        trigger: trigger,
      });

      // Erfolgreiche Antwort senden
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Automatische Antwort entfernt")
        .addFields(
          { name: "Trigger", value: trigger },
          { name: "Entfernte Antwort", value: autoResponse.response }
        )
        .setFooter({ text: `Entfernt von ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Entfernen der automatischen Antwort:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async ({ interaction, client, handler }) => {
    try {
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name !== "trigger") return;

      const focusedValue = focusedOption.value.toLowerCase();

      const autoResponses = await AutoResponse.find({
        guildId: interaction.guildId,
        trigger: { $regex: focusedValue, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .limit(25);

      const choices = autoResponses.map((ar) => ({
        name: `${ar.trigger} - ${ar.response.substring(0, 50)}...`,
        value: ar.trigger,
      }));

      await interaction.respond(choices);
    } catch (error) {
      console.error("Fehler in der Autocomplete-Funktion:", error);
      await interaction.respond([]);
    }
  },
};
