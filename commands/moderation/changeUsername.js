const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { Moderator } = require("../../mongoSchema");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("username-change")
    .setDescription("Ändert die Spitznamen von bis zu 5 Benutzern.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Der Name, der an den Discord-Namen angehängt werden soll."
        )
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("benutzer1")
        .setDescription(
          "Erster Benutzer, dessen Spitzname geändert werden soll."
        )
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("benutzer2")
        .setDescription(
          "Zweiter Benutzer, dessen Spitzname geändert werden soll."
        )
    )
    .addUserOption((option) =>
      option
        .setName("benutzer3")
        .setDescription(
          "Dritter Benutzer, dessen Spitzname geändert werden soll."
        )
    )
    .addUserOption((option) =>
      option
        .setName("benutzer4")
        .setDescription(
          "Vierter Benutzer, dessen Spitzname geändert werden soll."
        )
    )
    .addUserOption((option) =>
      option
        .setName("benutzer5")
        .setDescription(
          "Fünfter Benutzer, dessen Spitzname geändert werden soll."
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  run: async ({ interaction, client, handler }) => {
    const name = interaction.options.getString("name");
    const users = [
      interaction.options.getUser("benutzer1"),
      interaction.options.getUser("benutzer2"),
      interaction.options.getUser("benutzer3"),
      interaction.options.getUser("benutzer4"),
      interaction.options.getUser("benutzer5"),
    ].filter((user) => user !== null);

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

      let successCount = 0;
      let failCount = 0;
      let responseMessage = "";

      for (const user of users) {
        const member = await interaction.guild.members.fetch(user.id);
        const newNickname = `${user.username}/${name}`;

        try {
          await member.setNickname(newNickname);
          successCount++;
          responseMessage += `✅ Spitzname von \`${user.tag}\`\nerfolgreich zu \`${newNickname}\` geändert\n\n`;
        } catch (error) {
          failCount++;
          responseMessage += `❌ Fehler beim Ändern des Spitznamens \nvon \`${user.tag}\`**:** \`${error.message}\`\n\n`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(successCount > 0 ? "#00ff00" : "#ff0000")
        .setTitle("Spitznamen-Änderung Ergebnis")
        .setDescription(responseMessage)
        .addFields(
          {
            name: "Erfolgreich geändert",
            value: successCount.toString(),
            inline: true,
          },
          { name: "Fehlgeschlagen", value: failCount.toString(), inline: true }
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Fehler beim Ändern der Spitznamen:", error);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Fehler")
        .setDescription(
          "Es ist ein Fehler beim Ändern der Spitznamen aufgetreten."
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
