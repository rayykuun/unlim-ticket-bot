const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Giveaway, Moderator } = require("../../mongoSchema");

const durationOptions = [
  { name: "1 Minute", value: `60000` },
  { name: "5 Minuten", value: `300000` },
  { name: "10 Minuten", value: `600000` },
  { name: "30 Minuten", value: `1800000` },
  { name: "1 Stunde", value: `3600000` },
  { name: "2 Stunden", value: `7200000` },
  { name: "3 Stunden", value: `10800000` },
  { name: "5 Stunden", value: `18000000` },
  { name: "10 Stunden", value: `36000000` },
  { name: "12 Stunden", value: `43200000` },
  { name: "24 Stunden", value: `86400000` },
  { name: "2 Tage", value: `172800000` },
  { name: "3 Tage", value: `259200000` },
  { name: "4 Tage", value: `345600000` },
  { name: "5 Tage", value: `432000000` },
  { name: "6 Tage", value: `518400000` },
  { name: "1 Woche", value: `604800000` },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Erstellt ein neues Giveaway")
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("Der Preis des Giveaways")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Beschreibung oder zusätzliche Informationen")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Anzahl der Gewinner")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addRoleOption((option) =>
      option
        .setName("required_role")
        .setDescription("Erforderliche Rolle für die Teilnahme")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Dauer des Giveaways")
        .setRequired(true)
        .addChoices(...durationOptions)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  run: async ({ interaction, client }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });
      if (!moderator) {
        return interaction.reply({
          content: "Du hast keine Berechtigung, diesen Befehl auszuführen.",
          ephemeral: true,
        });
      }

      const prize = interaction.options.getString("prize");
      const description = interaction.options.getString("description");
      const winnerCount = interaction.options.getInteger("winners");
      const requiredRole = interaction.options.getRole("required_role");
      const duration = interaction.options.getString("duration");

      const endsAt = new Date(Date.now() + parseInt(duration));

      const embed = new EmbedBuilder()
        .setTitle("🎉 Neues Giveaway!")
        .setDescription(
          `**Preis:** ${prize}\n\n${description}\n\n**Gewinner:** ${winnerCount}\n**Erforderliche Rolle:** ${requiredRole}\n**Endet:** <t:${Math.floor(
            endsAt.getTime() / 1000
          )}:R>\n\n**Teilnehmen:**\n\nKlicke auf "Teilnehmen" um mitzumachen!`
        )
        .setColor("#FF00FF")
        .setFooter({ text: "Teilnehmer: 0" });

      const joinButton = new ButtonBuilder()
        .setCustomId("join_giveaway")
        .setLabel("Teilnehmen")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Primary);

      const listButton = new ButtonBuilder()
        .setCustomId("list_participants")
        .setEmoji("📄")
        .setLabel("Teilnehmer anzeigen")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(joinButton, listButton);

      const message = await interaction.channel.send({
        embeds: [embed],
        components: [row],
      });

      const giveaway = new Giveaway({
        messageId: message.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        prize,
        description,
        winnerCount,
        requiredRoleId: requiredRole.id,
        endsAt,
        hostId: interaction.user.id,
        participants: [],
      });

      await giveaway.save();

      interaction.reply({
        content: "Giveaway erfolgreich erstellt!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Erstellen des Giveaways:", error);
      interaction.reply({
        content: "Es gab einen Fehler beim Erstellen des Giveaways.",
        ephemeral: true,
      });
    }
  },
};
