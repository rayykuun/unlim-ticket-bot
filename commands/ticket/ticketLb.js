const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { TicketCloseStats, Moderator } = require("../../mongoSchema");
const { options } = require("./view-ticket");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("ticket-lb")
    .setDescription(
      "Zeigt das Leaderboard der geschlossenen Tickets für Moderatoren"
    ),

  run: async ({ interaction, client }) => {
    await interaction.deferReply();

    try {
      // Hole alle Moderatoren
      const moderators = await Moderator.find();

      // Hole die Ticket-Statistiken für alle Moderatoren
      const stats = await TicketCloseStats.find({
        userId: { $in: moderators.map((mod) => mod.userId) },
      }).sort({ closedTickets: -1 }); // Sortiere absteigend nach der Anzahl geschlossener Tickets

      // Berechne die Gesamtanzahl der geschlossenen Tickets
      const totalTickets = stats.reduce(
        (sum, stat) => sum + stat.closedTickets,
        0
      );

      // Erstelle die Beschreibung mit dem Leaderboard
      let description = `Gesamtanzahl geschlossener Tickets: ${totalTickets}\n\n`;
      description += "Leaderboard:\n";

      for (let i = 0; i < stats.length; i++) {
        const stat = stats[i];
        const moderator = moderators.find((mod) => mod.userId === stat.userId);
        if (moderator) {
          const user = await client.users.fetch(stat.userId);
          const percentage = (
            (stat.closedTickets / totalTickets) *
            100
          ).toFixed(2);
          description += `${i + 1}. \`\`\`${user.tag}: ${
            stat.closedTickets
          } | (${percentage}%)\`\`\`\n`;
        }
      }

      // Erstelle das Embed
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Ticket Leaderboard")
        .setDescription(description)
        .setTimestamp();

      // Sende das Embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Erstellen des Ticket Leaderboards:", error);
      await interaction.editReply(
        "Es gab einen Fehler beim Erstellen des Leaderboards. Bitte versuche es später erneut."
      );
    }
  },
};
