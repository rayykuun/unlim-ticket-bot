const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { LogChannel } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logchannel")
    .setDescription("Legt den Kanal für Nachrichtenlogs fest.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "Der Kanal, in den die Nachrichtenlogs gesendet werden sollen."
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  run: async ({ interaction, client, handler }) => {
    const channel = interaction.options.getChannel("channel");

    try {
      let logChannel = await LogChannel.findOne({
        guildId: interaction.guildId,
      });

      if (!logChannel) {
        logChannel = new LogChannel({
          guildId: interaction.guildId,
          channelId: channel.id,
        });
      } else {
        logChannel.channelId = channel.id;
      }

      await logChannel.save();

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Log-Kanal festgelegt")
        .setDescription(
          `Der Kanal ${channel} wurde erfolgreich als Log-Kanal festgelegt.`
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Festlegen des Log-Kanals:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Festlegen des Log-Kanals aufgetreten."
        );

      interaction.reply({ embeds: [embed] });
    }
  },
};
