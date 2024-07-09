const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Ticket, Moderator } = require("../../mongoSchema");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("view-ticket")
    .setDescription("Zeigt Informationen zu einem Ticket an")
    .addStringOption((option) =>
      option
        .setName("ticket_id")
        .setDescription("Die ID des Tickets")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  run: async ({ interaction, client, handler }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });

      if (!moderator) {
        return interaction.reply({
          content:
            "Du bist kein Moderator und kannst diesen Befehl nicht ausführen.",
          ephemeral: true,
        });
      }

      const ticketId = interaction.options.getString("ticket_id");
      const ticket = await Ticket.findOne({ ticketId: ticketId });

      if (!ticket) {
        return interaction.reply({
          content: "Ticket nicht gefunden.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Ticket Information: ${ticket.ticketId}`)
        .addFields(
          { name: "Status", value: ticket.status },
          { name: "Geöffnet von", value: `<@${ticket.openedBy}>` },
          { name: "Geöffnet am", value: ticket.openedAt.toLocaleString() },
          { name: "Kanal ID", value: ticket.channelId || "Nicht verfügbar" }
        );

      if (ticket.closedBy) {
        embed.addFields(
          { name: "Geschlossen von", value: `<@${ticket.closedBy}>` },
          { name: "Geschlossen am", value: ticket.closedAt.toLocaleString() }
        );
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`transcript_${ticket.ticketId}`)
          .setLabel("Transkript anzeigen")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Ticket-Informationen:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler beim Abrufen der Ticket-Informationen aufgetreten.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async ({ interaction, client, handler }) => {
    try {
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name !== "ticket_id") return;

      const focusedValue = focusedOption.value.toLowerCase();

      const tickets = await Ticket.find({
        ticketId: { $regex: focusedValue, $options: "i" },
      })
        .sort({ openedAt: -1 })
        .limit(25);

      const choices = tickets.map((ticket) => ({
        name: `${ticket.ticketId} - ${ticket.status}`,
        value: ticket.ticketId,
      }));

      await interaction.respond(choices);
    } catch (error) {
      console.error("Fehler in der Autocomplete-Funktion:", error);
      await interaction.respond([]);
    }
  },
};
