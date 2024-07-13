const { EmbedBuilder } = require("discord.js");
const { Giveaway } = require("../../mongoSchema");

module.exports = async (client) => {
  setInterval(async () => {
    const now = new Date();
    const endedGiveaways = await Giveaway.find({
      endsAt: { $lte: now },
      ended: false,
    });

    for (const giveaway of endedGiveaways) {
      try {
        const channel = await client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);

        const winners = selectWinners(
          giveaway.participants,
          giveaway.winnerCount
        );
        const winnerMentions = winners
          .map((winner) => `<@${winner}>`)
          .join(", ");

        const endEmbed = new EmbedBuilder()
          .setTitle("🎉 Giveaway beendet!")
          .setDescription(
            `**Preis:** ${giveaway.prize}\n\n${
              giveaway.description
            }\n\n**Gewinner:** ${winnerMentions || "Niemand"}`
          )
          .setColor("#00FF00")
          .setFooter({ text: `Teilnehmer: ${giveaway.participants.length}` });

        await message.edit({ embeds: [endEmbed], components: [] });

        if (winners.length > 0) {
          await channel.send(
            `Glückwunsch ${winnerMentions}! Ihr habt **${giveaway.prize}** gewonnen!`
          );
        } else {
          await channel.send(
            "Leider gab es keine gültigen Teilnehmer für dieses Giveaway."
          );
        }

        giveaway.ended = true;
        await giveaway.save();
      } catch (error) {
        console.error("Fehler beim Beenden des Giveaways:", error);
      }
    }
  }, 10000); // Überprüfe jede 10 sec
};

function selectWinners(participants, winnerCount) {
  const shuffled = participants.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(winnerCount, participants.length));
}
