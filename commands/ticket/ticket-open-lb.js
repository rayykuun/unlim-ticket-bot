const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Ticket, Moderator } = require("../../mongoSchema");
const { options } = require("./view-ticket");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("open-lb")
    .setDescription(
      "Zeigt die Top 15 Benutzer mit den meisten geöffneten Tickets."
    ),
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

      const ticketCounts = await Ticket.aggregate([
        { $group: { _id: "$openedBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]);

      const leaderboardEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Top 15 Ticket-Ersteller")
        .setDescription("Die Benutzer mit den meisten geöffneten Tickets:");

      for (let i = 0; i < ticketCounts.length; i++) {
        const user = await client.users.fetch(ticketCounts[i]._id);
        leaderboardEmbed.addFields({
          name: `${i + 1}. ${user.tag} **:** ${ticketCounts[i].count}`,
          value: " ",
        });
      }

      interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Fehler beim Erstellen des Leaderboards:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Erstellen des Leaderboards aufgetreten."
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
