const { EmbedBuilder } = require("discord.js");
const { Giveaway } = require("../../../mongoSchema");

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "join_giveaway") {
    try {
      const giveaway = await Giveaway.findOne({
        messageId: interaction.message.id,
      });

      if (!giveaway) {
        return interaction.reply({
          content: "Dieses Giveaway existiert nicht mehr.",
          ephemeral: true,
        });
      }

      if (Date.now() > giveaway.endsAt) {
        return interaction.reply({
          content: "Dieses Giveaway ist bereits beendet.",
          ephemeral: true,
        });
      }

      const member = interaction.member;
      if (!member.roles.cache.has(giveaway.requiredRoleId)) {
        return interaction.reply({
          content:
            "Du hast nicht die erforderliche Rolle, um an diesem Giveaway teilzunehmen.",
          ephemeral: true,
        });
      }

      if (giveaway.participants.includes(interaction.user.id)) {
        return interaction.reply({
          content: "Du nimmst bereits an diesem Giveaway teil.",
          ephemeral: true,
        });
      }

      giveaway.participants.push(interaction.user.id);
      await giveaway.save();

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);
      embed.setFooter({ text: `Teilnehmer: ${giveaway.participants.length}` });

      await interaction.message.edit({ embeds: [embed] });

      interaction.reply({
        content: "Du nimmst nun am Giveaway teil!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Teilnehmen am Giveaway:", error);
      interaction.reply({
        content: "Es gab einen Fehler beim Teilnehmen am Giveaway.",
        ephemeral: true,
      });
    }
  } else if (interaction.customId === "list_participants") {
    try {
      const giveaway = await Giveaway.findOne({
        messageId: interaction.message.id,
      });

      if (!giveaway) {
        return interaction.reply({
          content: "Dieses Giveaway existiert nicht mehr.",
          ephemeral: true,
        });
      }

      const participants = await Promise.all(
        giveaway.participants.map(async (userId) => {
          const user = await client.users.fetch(userId);
          return user.tag;
        })
      );

      const participantList =
        participants.join("\n") || "Noch keine Teilnehmer";

      interaction.reply({
        content: `**Teilnehmer (${participants.length}):**\n${participantList}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Anzeigen der Teilnehmer:", error);
      interaction.reply({
        content: "Es gab einen Fehler beim Anzeigen der Teilnehmer.",
        ephemeral: true,
      });
    }
  }
};
