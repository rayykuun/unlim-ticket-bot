const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { LogChannel, KickLog, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kickt einen Benutzer vom Server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der gekickt werden soll.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Der Grund für den Kick.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
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

      const member = await interaction.guild.members.fetch(user.id);

      if (!member.kickable) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription("Der Benutzer kann nicht gekickt werden.");

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await member.kick(reason);

      const logChannel = await LogChannel.findOne({
        guildId: interaction.guildId,
      });

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Benutzer gekickt")
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

      const kickLog = new KickLog({
        guildId: interaction.guildId,
        moderatorId: interaction.user.id,
        userId: user.id,
        reason: reason,
      });

      await kickLog.save();

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Benutzer gekickt")
        .setDescription(`${user.tag} wurde erfolgreich gekickt.`);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Kicken des Benutzers:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Kicken des Benutzers aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
