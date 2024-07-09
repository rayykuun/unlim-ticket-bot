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
  if (interaction.customId !== "asa_ticket") return;

  try {
    // Sofortige Antwort, um die Interaktion am Leben zu erhalten
    await interaction.deferReply({ ephemeral: true });

    const categoryId = "1257383112069873695"; // Ersetzen Sie dies durch die korrekte Kategorie-ID

    // Finde die nächste verfügbare Nummer für den Kanalnamen und die Ticket-ID
    const lastTicket = await Ticket.findOne({ ticketId: /^ASA-/ })
      .sort({
        openedAt: -1,
      })
      .lean();

    let nextNumber = 1;
    if (lastTicket) {
      nextNumber = parseInt(lastTicket.ticketId.split("-")[1]) + 1;
    }

    const ticketId = `ASA-${nextNumber.toString().padStart(4, "0")}`;
    const channelName = `🟡 asa-${nextNumber.toString().padStart(4, "0")}`;

    // Finde alle Moderatoren
    const moderators = await Moderator.find().lean();
    const moderatorIds = moderators.map((mod) => mod.userId);

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

    // Speichere das Ticket in der Datenbank
    const newTicket = new Ticket({
      ticketId: ticketId,
      openedBy: interaction.user.id,
      channelId: channel.id,
      status: "open",
    });

    await newTicket.save();

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
        "Herzlich Willkommen zu Deinem ASA Ticket!\nBitte schreibe schon mal dein Anliegen in den Chat.\nEin Admin wird sich so bald wie möglich darum kümmern.\n\nSollte nach 2h keine Nachricht in diesem Ticket geschrieben werden, wird das Ticket geschlossen."
      )
      .setFooter({
        text: "🔒 = Ticket schließen. \n🔔 = Reminder.",
      });

    await channel.send({
      content: `<@&1188598586544504843> ${interaction.user}`, // Ersetzen Sie ADMIN_ROLE_ID durch die tatsächliche Admin-Rollen-ID
      embeds: [embed],
      components: [row],
    });

    // Sende eine Bestätigung an den Benutzer
    const embed2 = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("ASA Ticket erstellt")
      .setDescription(
        `Dein ASA Ticket wurde erfolgreich erstellt. Bitte gehe zu ${channel} um fortzufahren.`
      );

    await interaction.editReply({
      embeds: [embed2],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Fehler beim Erstellen des ASA Ticket-Kanals:", error);

    // Versuche, eine Fehlerantwort zu senden
    try {
      await interaction.editReply({
        content:
          "Es gab einen Fehler beim Erstellen deines ASA Tickets. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
        ephemeral: true,
      });
    } catch (replyError) {
      console.error("Fehler beim Senden der Fehlerantwort:", replyError);
    }
  }
};
