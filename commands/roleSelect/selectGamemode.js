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
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("select-gamemode")
    .setDescription("Sendet ein Embed mit Buttons zur Auswahl des Spielmodus")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  run: async ({ interaction, client, handler }) => {
    try {
      // Überprüfen, ob der Benutzer ein Moderator ist
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });
      if (!moderator) {
        return interaction.reply({
          content: "Du hast keine Berechtigung, diesen Befehl zu verwenden.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Spielmodus auswählen")
        .addFields(
          {
            name: "GERMAN / DEUTSCH",
            value:
              "da wir beide Spiele anbieten:\n" +
              "- ARK ASE (ark survival evolved)\n" +
              "- ARK ASA (ARK Survival Ascended)\n" +
              "und wir nicht möchten dass ihr mit dem spiel zugetextet werded,\n" +
              "wo ihr nicht spielt habt ihr unten die möglichkeit euch für eins zu entscheiden. \n" +
              "selbstverständlich könnt ihr beide auswählen",
          },
          {
            name: "ENGLISH",
            value:
              "we offer both games:\n" +
              "- ARK ASE (ark survival evolved)\n" +
              "- ARK ASA (ARK Survival Ascended)\n" +
              "and we don't want you to be texted with the game you are not\n" +
              "playing you have the option to choose one. \n" +
              "of course you can choose both",
          }
        )
        .setFooter({
          text: "#unlimited-evolution",
        });

      const aseButton = new ButtonBuilder()
        .setCustomId("select_ase")
        .setEmoji("<:ase_logo:1260299085207048242>")
        .setLabel("ARK: Survival Evolved")
        .setStyle(ButtonStyle.Primary);

      const asaButton = new ButtonBuilder()
        .setCustomId("select_asa")
        .setEmoji("<:asa_logo:1260299426799554571>")
        .setLabel("ARK: Survival Ascended")
        .setStyle(ButtonStyle.Primary);

      const resetButton = new ButtonBuilder()
        .setCustomId("reset_gamemode")
        .setEmoji("✖️")
        .setLabel("Auswahl zurücksetzen")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(
        aseButton,
        asaButton,
        resetButton
      );

      await interaction.channel.send({
        embeds: [embed],
        components: [row],
      });

      await interaction.reply({
        content: "Das Embed zur Spielmodus-Auswahl wurde erfolgreich gesendet.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Senden des Spielmodus-Auswahl Embeds:", error);
      await interaction.reply({
        content:
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },
};
