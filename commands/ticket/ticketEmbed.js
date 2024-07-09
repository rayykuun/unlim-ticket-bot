const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketembed")
    .setDescription("Sendet ein Embed mit Ticket-Informationen und Buttons.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  run: async ({ interaction, client, handler }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });

      if (!moderator) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription(
            "Du bist kein Moderator und kannst diesen Befehl nicht ausführen."
          );

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const ticketEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Support-Ticket System")
        .setDescription(
          "**DEUTSCH:**\n" +
            "Bitte Wähle unten aus zu Welchem Spielmodus du Hilfe benötigst.\n" +
            "beachte dabei unsere Ticket zeiten:\n" +
            "- MO - SA 13 -21 UHR\n\n" +
            "**ENGLISH:**\n" +
            "Please choose below which game mode you need help with.\n" +
            "Note that our ticket opening times are:\n" +
            "- America/New_York: MO - SA 8am - 4pm"
        )
        .setFooter({
          text: "Ticket system für #unlimited-evolution.",
        });

      const aseButton = new ButtonBuilder()
        .setCustomId("ase_ticket")
        .setLabel("Ark: Survival Evolved")
        .setStyle(ButtonStyle.Primary);

      const asaButton = new ButtonBuilder()
        .setCustomId("asa_ticket")
        .setLabel("ARK Survival Ascended")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(aseButton, asaButton);

      await interaction.channel.send({
        embeds: [ticketEmbed],
        components: [row],
      });

      const successEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Ticket-Embed gesendet")
        .setDescription(
          "Das Ticket-Embed wurde erfolgreich mit Buttons gesendet."
        );

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error("Fehler beim Senden des Ticket-Embeds:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Senden des Ticket-Embeds aufgetreten."
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
