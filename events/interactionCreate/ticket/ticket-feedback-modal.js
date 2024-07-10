// In events/interactionCreate/ticket-feedback-modal.js

const { TicketFeedback, Ticket } = require("../../../mongoSchema");
const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("ticket_feedback_modal_")) return;

  const [, , , feedbackType, ticketId] = interaction.customId.split("_");
  const feedbackText = interaction.fields.getTextInputValue("feedback_text");

  try {
    // Finden des Tickets
    const ticket = await Ticket.findOne({ ticketId: ticketId });
    if (!ticket) {
      console.error(`Ticket nicht gefunden für ID: ${ticketId}`);
      return await interaction.reply({
        content:
          "Es gab einen Fehler beim Verarbeiten deines Feedbacks. Das zugehörige Ticket konnte nicht gefunden werden.",
        ephemeral: true,
      });
    }

    // Speichern des Feedbacks
    await TicketFeedback.create({
      userId: interaction.user.id,
      ticketId: ticketId,
      feedbackType: feedbackType,
      feedbackText: feedbackText,
      timestamp: new Date(),
    });

    // Aktualisieren der ursprünglichen Feedback-Nachricht
    try {
      const channel = await interaction.client.channels.fetch(
        interaction.channelId
      );
      const feedbackMessage = await channel.messages.fetch(
        interaction.message.id
      );

      const updatedEmbed = EmbedBuilder.from(
        feedbackMessage.embeds[0]
      ).setDescription("Vielen Dank für dein Feedback!");

      await feedbackMessage.edit({ embeds: [updatedEmbed], components: [] });
    } catch (messageError) {
      console.error(
        "Fehler beim Aktualisieren der Feedback-Nachricht:",
        messageError
      );
    }

    await interaction.reply({
      content: "Vielen Dank für dein ausführliches Feedback!",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Fehler beim Speichern des Feedbacks:", error);
    await interaction.reply({
      content:
        "Es gab einen Fehler beim Speichern deines Feedbacks. Bitte versuche es später erneut.",
      ephemeral: true,
    });
  }
};
