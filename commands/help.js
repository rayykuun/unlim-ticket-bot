const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Moderator } = require("../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Zeigt eine Liste aller verfügbaren Befehle für Moderatoren."
    ),
  run: async ({ interaction, client, handler }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });

      if (!moderator) {
        return interaction.reply({
          content: "Dieser Befehl ist nur für Moderatoren verfügbar.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Verfügbare Befehle für Moderatoren")
        .setDescription("Hier ist eine Liste aller verfügbaren Befehle:")
        .addFields(
          { name: "/kick", value: "Kickt einen Benutzer vom Server." },
          { name: "/ban", value: "Bannt einen Benutzer vom Server." },
          { name: "/warn", value: "Verwarnt einen Benutzer." },
          {
            name: "/removewarn",
            value: "Entfernt eine Verwarnung von einem Benutzer.",
          },
          {
            name: "/userinfo",
            value: "Zeigt Informationen zu einem Benutzer an.",
          },
          {
            name: "/username-change",
            value: "Ändert die Spitznamen von bis zu 5 Benutzern.",
          },
          {
            name: "/add-moderator [RAY]",
            value: "Fügt einen Moderator zur Datenbank hinzu.",
          },
          {
            name: "/remove-moderator [RAY]",
            value: "Entfernt einen Moderator aus der Datenbank.",
          },
          {
            name: "/logchannel [RAY]",
            value: "Legt den Kanal für Nachrichtenlogs fest.",
          },
          {
            name: "/add-level-reward",
            value: "Fügt eine Belohnung für ein bestimmtes Level hinzu.",
          },
          {
            name: "/remove-level-reward",
            value: "Entfernt eine Belohnung für ein bestimmtes Level.",
          },
          {
            name: "/ticketembed [RAY]",
            value: "Sendet ein Embed mit Ticket-Informationen und Buttons.",
          },
          {
            name: "/view-ticket",
            value: "Zeigt Informationen zu einem Ticket an.",
          },
          {
            name: "/ticket-lb",
            value:
              "Zeigt das Leaderboard der geschlossenen Tickets für Moderatoren.",
          },
          {
            name: "/add-user",
            value: "Fügt einen Benutzer zu einem Ticket hinzu.",
          },
          {
            name: "/open-lb",
            value:
              "Zeigt die Top 15 Benutzer mit den meisten geöffneten Tickets.",
          },
          {
            name: "/longest-tickets",
            value: "Zeigt die Top 10 längsten Tickets an.",
          }
        );

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error("Fehler beim Ausführen des Help-Befehls:", error);
      await interaction.reply({
        content: "Es ist ein Fehler beim Ausführen des Befehls aufgetreten.",
        ephemeral: true,
      });
    }
  },
};
