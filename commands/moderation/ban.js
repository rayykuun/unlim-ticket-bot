const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { LogChannel, BanLog, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannt einen Benutzer vom Server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der gebannt werden soll.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Der Grund für den Bann.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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

      if (!member.bannable) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription("Der Benutzer kann nicht gebannt werden.");

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await member.ban({ reason: reason });

      const logChannel = await LogChannel.findOne({
        guildId: interaction.guildId,
      });

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Benutzer gebannt")
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

      const banLog = new BanLog({
        guildId: interaction.guildId,
        moderatorId: interaction.user.id,
        userId: user.id,
        reason: reason,
      });

      await banLog.save();

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Benutzer gebannt")
        .setDescription(`${user.tag} wurde erfolgreich gebannt.`);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Bannen des Benutzers:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Bannen des Benutzers aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
