const { SlashCommandBuilder } = require("discord.js");
const { LevelReward } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-level-reward")
    .setDescription("Entfernt eine Belohnung für ein bestimmtes Level.")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription(
          "Das Level, für das die Belohnung entfernt werden soll."
        )
        .setRequired(true)
    ),
  run: async ({ interaction }) => {
    const level = interaction.options.getInteger("level");

    try {
      // Suche nach der Belohnung für das angegebene Level
      const reward = await LevelReward.findOne({
        guildId: interaction.guildId,
        level,
      });

      if (!reward) {
        return interaction.reply(
          `Für Level ${level} existiert keine Belohnung.`
        );
      }

      // Entferne die Belohnung aus der Datenbank
      await LevelReward.deleteOne({ guildId: interaction.guildId, level });

      interaction.reply(
        `Die Belohnung für Level ${level} wurde erfolgreich entfernt.`
      );
    } catch (error) {
      console.error("Fehler beim Entfernen der Belohnung:", error);
      interaction.reply(
        "Es ist ein Fehler beim Entfernen der Belohnung aufgetreten."
      );
    }
  },
};
