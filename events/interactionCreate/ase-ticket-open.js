const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Moderator, Ticket } = require("../../mongoSchema");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "ase_ticket") return;

  try {
    // Sofortige Antwort, um die Interaktion am Leben zu erhalten
    await interaction.deferReply({ ephemeral: true });

    const categoryId = "1257383112069873695"; // Überprüfen Sie, ob diese ID korrekt ist

    // Logging für Debugging
    console.log("Suche nach dem letzten Ticket...");

    // Finde die nächste verfügbare Nummer für den Kanalnamen und die Ticket-ID
    const lastTicket = await Ticket.findOne({ ticketId: /^ASE-/ })
      .sort({
        openedAt: -1,
      })
      .lean(); // Verwenden Sie .lean() für schnellere Abfragen

    console.log("Letztes Ticket gefunden:", lastTicket);

    let nextNumber = 1;
    if (lastTicket) {
      nextNumber = parseInt(lastTicket.ticketId.split("-")[1]) + 1;
    }

    const ticketId = `ASE-${nextNumber.toString().padStart(4, "0")}`;
    const channelName = `🟢 ase-${nextNumber.toString().padStart(4, "0")}`;

    console.log("Neue Ticket-ID:", ticketId);

    // Finde alle Moderatoren
    const moderators = await Moderator.find().lean();
    const moderatorIds = moderators.map((mod) => mod.userId);

    console.log("Moderatoren gefunden:", moderatorIds.length);

    // Erstelle den Kanal
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        ...moderatorIds.map((id) => ({
          id: id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        })),
      ],
    });

    console.log("Kanal erstellt:", channel.id);

    // Speichere das Ticket in der Datenbank
    const newTicket = new Ticket({
      ticketId: ticketId,
      openedBy: interaction.user.id,
      channelId: channel.id,
      status: "open",
    });

    await newTicket.save();

    console.log("Ticket in Datenbank gespeichert");

    // Erstelle die Buttons
    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger);

    const reminderButton = new ButtonBuilder()
      .setCustomId("reminder_ticket")
      .setEmoji("🔔")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(
      closeButton,
      reminderButton
    );

    // Sende eine Nachricht in den neuen Kanal
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle(`${ticketId}`)
      .setDescription(
        "Herzlich Wilkommen zu Deinem Ticket!\nBitte schreibe schonmal dein Anliegen in den Chat.\nein Admin wird sich so bald wie möglich drumm kümmern.\n\nsollte nach 2h keine Nachricht in diesem ticket geschrieben werden wird das Ticket geschlossen"
      )
      .setFooter({
        text: "🔒 = ticket schliesen. \n🔔 = reminder.",
      });

    await channel.send({
      content: `<@&1211393369004052491> ${interaction.user}`,
      embeds: [embed],
      components: [row],
    });

    console.log("Nachricht im Kanal gesendet");

    // Sende eine Bestätigung an den Benutzer
    const embed2 = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Ticket erstellt")
      .setDescription(
        `Dein Ticket wurde erfolgreich erstellt. Bitte gehe zu ${channel} um fortzufahren.`
      );

    await interaction.editReply({
      embeds: [embed2],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Fehler beim Erstellen des Ticket-Kanals:", error);

    // Versuche, eine Fehlerantwort zu senden
    try {
      await interaction.editReply({
        content:
          "Es gab einen Fehler beim Erstellen deines Tickets. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
        ephemeral: true,
      });
    } catch (replyError) {
      console.error("Fehler beim Senden der Fehlerantwort:", replyError);
    }
  }
};
