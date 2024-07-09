// In events/interactionCreate/ticketFeedbackSelect.js

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (!interaction.customId.startsWith("ticket_feedback_")) return;

  const [feedbackType, ticketId] = interaction.values[0].split("_");

  const modal = new ModalBuilder()
    .setCustomId(`ticket_feedback_modal_${feedbackType}_${ticketId}`)
    .setTitle("Ticket Feedback");

  const feedbackInput = new TextInputBuilder()
    .setCustomId("feedback_text")
    .setLabel("Dein detailliertes Feedback")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(500)
    .setPlaceholder(
      "Bitte gib hier dein detailliertes Feedback ein (max. 500 Zeichen)"
    )
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(feedbackInput);

  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
};
