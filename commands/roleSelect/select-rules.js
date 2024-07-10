const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Choose your preferred language"),

  run: async ({ interaction, client, handler }) => {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setImage(
        "https://cdn.discordapp.com/attachments/1200530123007479949/1260628654363508907/DALLE_2024-07-10_18.07.40_-_A_realistic_high-quality_image_featuring_a_few_dinosaurs_in_a_setting_with_colors_dominated_by_purple_black_blue_and_white._The_dinosaurs_are_depi.webp?ex=6690036c&is=668eb1ec&hm=3d5cf84b5750dc51f87e703ffed77acf80352123a633a98170d6b93db9173063&"
      )
      .setTitle("*️⃣ REGELN / RULES /\n*️⃣ REGLAS / RÈGLEMENTS");

    const select = new StringSelectMenuBuilder()
      .setCustomId("language_select")
      .setPlaceholder("Select a language")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("DEUTSCH")
          .setValue("de")
          .setEmoji("🇩🇪"),
        new StringSelectMenuOptionBuilder()
          .setLabel("ENGLISH")
          .setValue("en")
          .setEmoji("🇬🇧"),
        new StringSelectMenuOptionBuilder()
          .setLabel("ESPAÑOL")
          .setValue("es")
          .setEmoji("🇪🇸"),
        new StringSelectMenuOptionBuilder()
          .setLabel("FRANÇAIS")
          .setValue("fr")
          .setEmoji("🇫🇷")
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
