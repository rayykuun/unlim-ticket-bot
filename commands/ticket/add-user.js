const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { Ticket, Moderator } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-user")
    .setDescription("Fügt einen Benutzer zu einem Ticket hinzu.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Der Benutzer, der zum Ticket hinzugefügt werden soll.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  run: async ({ interaction, client, handler }) => {
    try {
      // Überprüfen, ob der Befehlsausführende ein Moderator ist
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

      // Überprüfen, ob der Befehl in einem Ticket-Kanal ausgeführt wird
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });

      if (!ticket) {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Fehler")
          .setDescription(
            "Dieser Befehl kann nur in einem Ticket-Kanal ausgeführt werden."
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const channel = interaction.channel;

      // Berechtigungen für den Benutzer setzen
      await channel.permissionOverwrites.edit(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Benutzer hinzugefügt")
        .setDescription(`${user} wurde erfolgreich zum Ticket hinzugefügt.`);

      await interaction.reply({ embeds: [embed] });

      // Log-Nachricht im Ticket
      const logEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setDescription(
          `${interaction.user} hat ${user} zum Ticket hinzugefügt.`
        )
        .setTimestamp();

      await channel.send({ embeds: [logEmbed] });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Benutzers zum Ticket:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Hinzufügen des Benutzers zum Ticket aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
