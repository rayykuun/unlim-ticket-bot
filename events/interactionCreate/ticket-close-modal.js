const {
  EmbedBuilder,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Ticket, Moderator } = require("../../mongoSchema");
const discordTranscripts = require("discord-html-transcripts");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "close_ticket") return;

  try {
    const isModerator = await Moderator.findOne({
      userId: interaction.user.id,
    });
    if (!isModerator) {
      return interaction.reply({
        content: "Nur Moderatoren können Tickets schließen.",
        ephemeral: true,
      });
    }

    // Erstelle das Modal
    const modal = new ModalBuilder()
      .setCustomId("close_ticket_modal")
      .setTitle("Ticket schließen");

    // Füge ein Textfeld für den Grund hinzu
    const reasonInput = new TextInputBuilder()
      .setCustomId("close_reason")
      .setLabel("Grund für das Schließen des Tickets")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    // Füge das Textfeld zum Modal hinzu
    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(firstActionRow);

    // Zeige das Modal an
    await interaction.showModal(modal);
  } catch (error) {
    console.error("Fehler beim Öffnen des Modals:", error);
    await interaction.reply({
      content:
        "Es gab einen Fehler beim Öffnen des Modals. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
      ephemeral: true,
    });
  }
};
