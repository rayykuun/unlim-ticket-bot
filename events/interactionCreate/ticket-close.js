const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
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

    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });

    if (!ticket) {
      return interaction.reply({
        content: "Dieses Ticket konnte nicht in der Datenbank gefunden werden.",
        ephemeral: true,
      });
    }

    // Informiere den Benutzer
    await interaction.reply({
      content:
        "Das Ticket wird in 5 Sekunden geschlossen. Ein Transkript wird erstellt.",
      ephemeral: false,
    });

    // Erstelle das Transkript
    const transcript = await discordTranscripts.createTranscript(
      interaction.channel,
      {
        limit: -1, // Unbegrenzte Nachrichten
        fileName: `ticket-${ticket.ticketId}.html`,
        poweredBy: false,
        saveImages: true,
        footerText: "#Unlimited-Evolution Ticket system",
        customEmojis: true,
      }
    );

    // Konvertiere das Transkript in einen String
    const transcriptBuffer = Buffer.from(await transcript.attachment);
    const transcriptString = transcriptBuffer.toString("utf-8");

    // Erstelle einen Attachment aus dem Transkript
    const attachment = new AttachmentBuilder(transcriptBuffer, {
      name: `transcript-${ticket.ticketId}.html`,
    });

    // Sende das Transkript an einen Log-Kanal (ersetzen Sie 'LOG_CHANNEL_ID' durch die tatsächliche ID)
    const logChannel = interaction.guild.channels.cache.get(
      "1257383155745296384"
    );
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Ticket Geschlossen: ${ticket.ticketId}`)
        .addFields(
          { name: "Geschlossen von", value: interaction.user.tag },
          { name: "Geöffnet von", value: `<@${ticket.openedBy}>` },
          { name: "Geöffnet am", value: ticket.openedAt.toLocaleString() },
          { name: "Geschlossen am", value: new Date().toLocaleString() }
        );

      await logChannel.send({
        embeds: [logEmbed],
        files: [attachment],
      });
    }

    // Aktualisiere das Ticket in der Datenbank
    ticket.status = "closed";
    ticket.closedBy = interaction.user.id;
    ticket.closedAt = new Date();
    ticket.transcript = transcriptString; // Speichere das Transkript in der Datenbank
    await ticket.save();

    // Warte 5 Sekunden
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Lösche den Kanal
    await interaction.channel.delete();
  } catch (error) {
    console.error("Fehler beim Schließen des Tickets:", error);
    await interaction.followUp({
      content:
        "Es gab einen Fehler beim Schließen des Tickets. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
      ephemeral: true,
    });
  }
};
