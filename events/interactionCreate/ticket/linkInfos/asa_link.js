const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "link_asa") return;

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("ASA Informationen")
    .setDescription(
      "hier findest du zusätzliche infos die möglicherweise helfen"
    )
    .addFields([
      {
        name: "STARTER",
        value:
          "**Du kanst dir dein Starter ingame selber Claimen mit dem befehl:** \n\n" +
          "- /kit starter1 1 (Argentavis)\n" +
          "- /kit starter2 1 (Thyacoleo)\n" +
          "- /kit starter3 1 (Doedicurus)\n\n" +
          "**alle Starter Kits kommen mit:**\n" +
          "- komplettes Flack set" +
          "- Metall Spitzhacke / Axt, Sichel, Schwert" +
          "- Metall Tafel",
      },
      {
        name: "SHOP",
        value:
          "Du findest unseren shop in diesem Channel: <#1180212884958097489>",
      },
      {
        name: "INFOS / TUTORIALS",
        value: "du findest infos und Tutorials hier: <#1180217952793002148>",
      },
    ]);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
