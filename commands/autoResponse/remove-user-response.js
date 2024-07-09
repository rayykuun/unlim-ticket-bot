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
    .setName("remove-user-response")
    .setDescription("Entfernt eine benutzerspezifische Antwort")
    .addStringOption((option) =>
      option
        .setName("user_id")
        .setDescription(
          "Die ID des Benutzers, dessen Antwort entfernt werden soll"
        )
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

      const userId = interaction.options.getString("user_id");

      // Suche nach der UserResponse
      const userResponse = await UserResponse.findOne({
        guildId: interaction.guildId,
        userId: userId,
      });

      if (!userResponse) {
        return interaction.reply({
          content:
            "Es wurde keine benutzerspezifische Antwort für diesen Benutzer gefunden.",
          ephemeral: true,
        });
      }

      // Lösche die UserResponse
      await UserResponse.deleteOne({
        guildId: interaction.guildId,
        userId: userId,
      });

      const user = await client.users.fetch(userId);

      // Erfolgreiche Antwort senden
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Benutzerspezifische Antwort entfernt")
        .addFields(
          { name: "Benutzer", value: user.tag },
          { name: "Entfernte Antwort", value: userResponse.response }
        )
        .setFooter({ text: `Entfernt von ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(
        "Fehler beim Entfernen der benutzerspezifischen Antwort:",
        error
      );
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
      if (focusedOption.name !== "user_id") return;

      const focusedValue = focusedOption.value.toLowerCase();

      const userResponses = await UserResponse.find({
        guildId: interaction.guildId,
        userId: { $regex: focusedValue, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .limit(25);

      const choices = await Promise.all(
        userResponses.map(async (ur) => {
          const user = await client.users.fetch(ur.userId);
          return {
            name: `${user.tag} - ${ur.response.substring(0, 50)}...`,
            value: ur.userId,
          };
        })
      );

      await interaction.respond(choices);
    } catch (error) {
      console.error("Fehler in der Autocomplete-Funktion:", error);
      await interaction.respond([]);
    }
  },
};
