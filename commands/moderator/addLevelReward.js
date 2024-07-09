const { SlashCommandBuilder } = require("discord.js");
const { LevelReward } = require("../../mongoSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-level-reward")
    .setDescription("Fügt eine Belohnung für ein bestimmtes Level hinzu.")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Das Level, für das die Belohnung gilt.")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Die Rolle, die als Belohnung vergeben wird.")
        .setRequired(true)
    ),
  run: async ({ interaction }) => {
    const level = interaction.options.getInteger("level");
    const role = interaction.options.getRole("role");

    try {
      // Überprüfe, ob für das angegebene Level bereits eine Belohnung existiert
      const existingReward = await LevelReward.findOne({
        guildId: interaction.guildId,
        level,
      });

      if (existingReward) {
        return interaction.reply(
          `Für Level ${level} existiert bereits eine Belohnung.`
        );
      }

      // Erstelle eine neue Belohnung
      const newReward = new LevelReward({
        guildId: interaction.guildId,
        level,
        roleId: role.id,
      });

      // Speichere die neue Belohnung in der Datenbank
      await newReward.save();

      interaction.reply(
        `Die Belohnung für Level ${level} wurde erfolgreich hinzugefügt.`
      );
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Belohnung:", error);
      interaction.reply(
        "Es ist ein Fehler beim Hinzufügen der Belohnung aufgetreten."
      );
    }
  },
};
