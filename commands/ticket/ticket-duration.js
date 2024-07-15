const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Ticket, Moderator } = require("../../mongoSchema");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("longest-tickets")
    .setDescription("Zeigt die Top 10 längsten Tickets an."),
  run: async ({ interaction, client, handler }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });

      if (!moderator) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription(
            "Du bist kein Moderator und kannst diesen Befehl nicht ausführen."
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const longestTickets = await Ticket.find({ status: "closed" })
        .sort({ duration: -1 })
        .limit(10);

      const leaderboardEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Top 10 Längste Tickets")
        .setDescription("Die Tickets mit der längsten Dauer:");

      for (let i = 0; i < longestTickets.length; i++) {
        const ticket = longestTickets[i];
        const durationHours = Math.floor(ticket.duration / 3600);
        const durationMinutes = Math.floor((ticket.duration % 3600) / 60);

        leaderboardEmbed.addFields({
          name: `${i + 1}. Ticket ${ticket.ticketId}`,
          value: `Dauer: ${durationHours} Stunden, ${durationMinutes} Minuten\nErstellt von: <@${ticket.openedBy}>`,
        });
      }

      interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Fehler beim Erstellen der längsten Tickets Liste:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Erstellen der längsten Tickets Liste aufgetreten."
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
