const { EmbedBuilder } = require("discord.js");
const { Moderator, Ticket } = require("../../mongoSchema");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "reminder_ticket") return;

  try {
    // Überprüfe, ob der Benutzer ein Moderator ist
    const moderator = await Moderator.findOne({ userId: interaction.user.id });
    if (!moderator) {
      return interaction.reply({
        content: "Nur Moderatoren können diese Aktion ausführen.",
        ephemeral: true,
      });
    }

    // Finde das Ticket in der Datenbank
    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
    if (!ticket) {
      return interaction.reply({
        content: "Dieses Ticket konnte nicht in der Datenbank gefunden werden.",
        ephemeral: true,
      });
    }

    // Ping den Ticket-Ersteller
    const ticketCreator = await interaction.guild.members.fetch(
      ticket.openedBy
    );
    await interaction.channel.send(`${ticketCreator}`);

    // Erstelle und sende das Embed
    const reminderEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("bitte antworte auf dein Ticket!")
      .setFooter({ text: `id: ${ticket.ticketId}` })
      .setTimestamp();

    await interaction.channel.send({ embeds: [reminderEmbed] });

    // Bestätige die Aktion
    await interaction.reply({
      content: "Erinnerung wurde gesendet.",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Erinnerung:", error);
    await interaction.reply({
      content:
        "Es gab einen Fehler beim Senden der Erinnerung. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
      ephemeral: true,
    });
  }
};
