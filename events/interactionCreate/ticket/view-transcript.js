const { EmbedBuilder } = require("discord.js");
const { Ticket, Moderator } = require("../../../mongoSchema");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("transcript_")) return;

  try {
    const moderator = await Moderator.findOne({ userId: interaction.user.id });
    if (!moderator) {
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Du bist kein Moderator und kannst diese Aktion nicht ausführen."
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const ticketId = interaction.customId.split("_")[1];
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket || !ticket.transcript) {
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription("Transkript nicht gefunden.");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Sende das Transkript als Datei
    const buffer = Buffer.from(ticket.transcript, "utf-8");
    await interaction.reply({
      content: `Hier ist das Transkript für Ticket ${ticketId}:`,
      files: [
        {
          attachment: buffer,
          name: `transcript_${ticketId}.html`,
        },
      ],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Transkripts:", error);
    const embed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("Fehler")
      .setDescription(
        "Es ist ein Fehler beim Abrufen des Transkripts aufgetreten."
      );

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
