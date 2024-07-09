const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { LogChannel, WarnLog, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Entfernt eine Verwarnung von einem Benutzer.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, dessen Verwarnung entfernt werden soll.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("warn_id")
        .setDescription("Die ID der zu entfernenden Verwarnung.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  run: async ({ interaction, client, handler }) => {
    const user = interaction.options.getUser("user");
    const warnId = interaction.options.getString("warn_id");

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

      const warnLog = await WarnLog.findOneAndDelete({
        _id: warnId,
        userId: user.id,
      });

      if (!warnLog) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription(
            "Die angegebene Verwarnung konnte nicht gefunden werden."
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const logChannel = await LogChannel.findOne({
        guildId: interaction.guildId,
      });

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("Verwarnung entfernt")
          .addFields(
            { name: "Moderator", value: interaction.user.tag },
            { name: "Benutzer", value: user.tag },
            { name: "Verwarnung", value: warnLog.reason }
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
        .setColor("#00ff00")
        .setTitle("Verwarnung entfernt")
        .setDescription(
          `Die Verwarnung von ${user.tag} wurde erfolgreich entfernt.`
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Entfernen der Verwarnung:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Entfernen der Verwarnung aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
  autocomplete: async (interaction) => {
    const user = interaction.options.getUser("user");
    const focusedValue = interaction.options.getFocused();

    if (!user) {
      return interaction.respond([]);
    }

    try {
      const warnLogs = await WarnLog.find({ userId: user.id })
        .sort({ timestamp: -1 })
        .limit(25);

      const choices = warnLogs.map((warnLog) => ({
        name: `${warnLog.reason.slice(0, 10)}...`,
        value: warnLog._id.toString(),
      }));

      interaction.respond(choices);
    } catch (error) {
      console.error("Fehler beim Abrufen der Verwarnungen:", error);
      interaction.respond([]);
    }
  },
};
