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
    const categoryId = "1257383112069873695"; // Stellen Sie sicher, dass dies die korrekte Kategorie-ID für ASA-Tickets ist

    // Finde die nächste verfügbare Nummer für den Kanalnamen und die Ticket-ID
    const lastTicket = await Ticket.findOne({ ticketId: /^ASA-/ }).sort({
      openedAt: -1,
    });

    let nextNumber = 1;
    if (lastTicket) {
      nextNumber = parseInt(lastTicket.ticketId.split("-")[1]) + 1;
    }

    const ticketId = `ASA-${nextNumber.toString().padStart(4, "0")}`;
    const channelName = `🟡 asa-${nextNumber.toString().padStart(4, "0")}`;

    // Finde alle Moderatoren
    const moderators = await Moderator.find();
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

    // Sende eine Bestätigung an den Benutzer
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Ticket erstellt")
      .setDescription(
        `Dein Ticket wurde erfolgreich erstellt. Bitte gehe zu ${channel} um fortzufahren.`
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

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
    const embed2 = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle(`${ticketId}`)
      .setDescription(
        "Herzlich Willkommen zu Deinem Ticket!\nBitte schreibe schon mal dein Anliegen in den Chat.\nEin Admin wird sich so bald wie möglich darum kümmern.\n\nSollte nach 2h keine Nachricht in diesem Ticket geschrieben werden, wird das Ticket geschlossen."
      );
    await channel.send({
      content: `<@&1211393369004052491> ${interaction.user}`,
      embeds: [embed2],
      components: [row],
    });
  } catch (error) {
    console.error("Fehler beim Erstellen des Ticket-Kanals:", error);
    await interaction.reply({
      content:
        "Es gab einen Fehler beim Erstellen deines Tickets. Bitte versuche es später erneut oder kontaktiere einen Administrator.",
      ephemeral: true,
    });
  }
};
