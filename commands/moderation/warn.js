const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { LogChannel, WarnLog, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Verwarnt einen Benutzer.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der verwarnt werden soll.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Der Grund für die Verwarnung.")
        .setRequired(true)
    ),
  options: {
    devOnly: true,
  },
  run: async ({ interaction, client, handler }) => {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });

      if (!moderator) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription(
            "Du bist kein Moderator und kannst diesen Befehl nicht ausführen."
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const warnLog = new WarnLog({
        guildId: interaction.guildId,
        moderatorId: interaction.user.id,
        userId: user.id,
        reason: reason,
      });

      await warnLog.save();

      const logChannel = await LogChannel.findOne({
        guildId: interaction.guildId,
      });

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#ffff00")
          .setTitle("Benutzer verwarnt")
          .addFields(
            { name: "Moderator", value: interaction.user.tag },
            { name: "Benutzer", value: user.tag },
            { name: "Grund", value: reason }
          )
          .setTimestamp();

        const channel = interaction.guild.channels.cache.get(
          logChannel.channelId
        );
        if (channel) {
          channel.send({ embeds: [embed] });
        }
      }

      const embed = new EmbedBuilder()
        .setColor("#ffff00")
        .setTitle("Benutzer verwarnt")
        .setDescription(`${user.tag} wurde erfolgreich verwarnt.`);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Verwarnen des Benutzers:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Verwarnen des Benutzers aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
