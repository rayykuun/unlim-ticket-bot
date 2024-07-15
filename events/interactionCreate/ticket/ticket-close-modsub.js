const {
  EmbedBuilder,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { Ticket, TicketCloseStats } = require("../../../mongoSchema");
const discordTranscripts = require("discord-html-transcripts");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "close_ticket_modal") return;

  try {
    const reason = interaction.fields.getTextInputValue("close_reason");

    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });

    if (!ticket) {
      return interaction.reply({
        content: "Dieses Ticket konnte nicht in der Datenbank gefunden werden.",
        ephemeral: true,
      });
    }

    // Aktualisiere die Ticket-Schließ-Statistiken
    let stats = await TicketCloseStats.findOne({ userId: interaction.user.id });
    if (!stats) {
      stats = new TicketCloseStats({ userId: interaction.user.id });
    }
    stats.closedTickets += 1;
    stats.lastClosedAt = new Date();
    await stats.save();

    // Informiere den Benutzer
    await interaction.reply({
      content: `Das Ticket wird in 5 Sekunden geschlossen. Grund: ${reason}`,
      ephemeral: false,
    });

    // Erstelle das Transkript
    const transcript = await discordTranscripts.createTranscript(
      interaction.channel,
      {
        limit: -1,
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

    // Sende nur die Nachricht an den Log-Kanal
    const logChannel = interaction.guild.channels.cache.get(
      "1257383155745296384"
    );
    const duration = (new Date() - ticket.openedAt) / 1000; // Duration in seconds
    ticket.duration = duration;
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Ticket Geschlossen: ${ticket.ticketId}`)
        .addFields(
          { name: "Geschlossen von", value: interaction.user.tag },
          { name: "Geöffnet von", value: `<@${ticket.openedBy}>` },
          { name: "Geöffnet am", value: ticket.openedAt.toLocaleString() },
          { name: "Geschlossen am", value: new Date().toLocaleString() },
          {
            name: "Dauer",
            value: `${Math.floor(duration / 3600)} Stunden, ${Math.floor(
              (duration % 3600) / 60
            )} Minuten`,
          },
          { name: "Grund", value: reason },
          {
            name: `Geschlossene Tickets (von ${interaction.user.tag})`,
            value: `${stats.closedTickets}`,
          }
        );

      await logChannel.send({ embeds: [logEmbed] });
    }

    // Sende eine DM an den Benutzer, der das Ticket geöffnet hat
    try {
      const user = await client.users.fetch(ticket.openedBy);
      const dmEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Dein Ticket wurde geschlossen: ${ticket.ticketId}`)
        .addFields(
          { name: "Geschlossen von", value: interaction.user.tag },
          { name: "Geschlossen am", value: new Date().toLocaleString() },
          { name: "Grund", value: reason }
        );

      const feedbackMessage = await user.send({
        embeds: [dmEmbed],
      });

      // Speichern Sie die Message-ID in der Datenbank
      await Ticket.findByIdAndUpdate(ticket._id, {
        feedbackMessageId: feedbackMessage.id,
      });
    } catch (error) {
      console.error("Fehler beim Senden der DM:", error);
    }

    // Aktualisiere das Ticket in der Datenbank
    ticket.status = "closed";
    ticket.closedBy = interaction.user.id;
    ticket.closedAt = new Date();
    ticket.transcript = transcriptString;
    ticket.closeReason = reason;
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
