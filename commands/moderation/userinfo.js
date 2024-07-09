const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const { WarnLog, UserXP, MemberLog, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Zeigt Informationen zu einem Benutzer an.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "Der Benutzer, dessen Informationen angezeigt werden sollen."
        )
        .setRequired(true)
    ),
  run: async ({ interaction, client, handler }) => {
    const user = interaction.options.getUser("user");

    try {
      // Anzahl der Verwarnungen abrufen
      const warnCount = await WarnLog.countDocuments({ userId: user.id });

      // Level und XP des Benutzers abrufen
      const userXP = await UserXP.findOne({ userId: user.id });
      const level = userXP ? userXP.level : 0;
      const xp = userXP ? userXP.xp : 0;

      // Datum des Server-Beitritts abrufen
      const memberLog = await MemberLog.findOne({ userId: user.id });
      const serverJoined = memberLog
        ? memberLog.serverJoins.find(
            (join) => join.guildId === interaction.guildId
          )?.joinedAt
        : null;

      // Überprüfen, ob der Benutzer ein Moderator ist
      const isModerator = await Moderator.exists({ userId: user.id });

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`Benutzerinformationen für ${user.tag}`)
        .addFields(
          {
            name: `Verwarnungen: ${warnCount.toString()}`,
            value: " ",
          },
          {
            name: `XP / Level: ${xp.toString()}/${level.toString()}`,
            value: " ",
          },
          {
            name: `Moderator: ${isModerator ? "Ja" : "Nein"}`,
            value: " ",
          },
          {
            name: "Server beigetreten",
            value: serverJoined
              ? serverJoined.toDateString()
              : "Nicht bekannt \n(vor dem 25.07.2024)",
          }
        );

      // Select-Menü erstellen
      const select = new StringSelectMenuBuilder()
        .setCustomId("userinfo")
        .setPlaceholder("Wähle eine Kategorie")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Verwarnungen")
            .setDescription("Zeigt die Anzahl der Verwarnungen")
            .setValue("warnings"),
          new StringSelectMenuOptionBuilder()
            .setLabel("XP & Level")
            .setDescription("Zeigt XP und Level des Benutzers")
            .setValue("xp"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Moderation")
            .setDescription("Zeigt Moderationsinformationen")
            .setValue("moderation")
        );

      const row = new ActionRowBuilder().addComponents(select);

      // Antwort senden
      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Benutzerinformationen:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Abrufen der Benutzerinformationen aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
