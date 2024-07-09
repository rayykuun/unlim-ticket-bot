const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { WarnLog } = require("../../mongoSchema");

module.exports = async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== "userinfo")
    return;

  if (interaction.values[0] === "warnings") {
    // Extrahiere die Benutzer-ID aus dem Embed-Titel
    const embedTitle = interaction.message.embeds[0].title;
    const match = embedTitle.match(/für (.+)$/);
    if (!match) {
      console.error(
        "Konnte Benutzernamen nicht aus dem Embed-Titel extrahieren"
      );
      return await interaction.reply({
        content: "Es ist ein Fehler aufgetreten.",
        ephemeral: true,
      });
    }
    const username = match[1];

    // Finde den Benutzer basierend auf dem Benutzernamen
    const user = interaction.guild.members.cache.find(
      (member) => member.user.tag === username
    )?.user;
    if (!user) {
      console.error("Konnte Benutzer nicht finden:", username);
      return await interaction.reply({
        content: "Benutzer konnte nicht gefunden werden.",
        ephemeral: true,
      });
    }

    let page = 0;
    const warningsPerPage = 5;

    const generateWarningsEmbed = async (page) => {
      const warnings = await WarnLog.find({ userId: user.id })
        .sort({ timestamp: -1 })
        .skip(page * warningsPerPage)
        .limit(warningsPerPage);

      const totalWarnings = await WarnLog.countDocuments({ userId: user.id });
      const totalPages = Math.ceil(totalWarnings / warningsPerPage);

      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle(`Verwarnungen für ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Seite ${page + 1} von ${totalPages}` });

      if (warnings.length === 0) {
        embed.setDescription("Keine Verwarnungen gefunden.");
      } else {
        warnings.forEach((warn, index) => {
          embed.addFields({
            name: `Verwarnung ${index + 1 + page * warningsPerPage}`,
            value: `Grund: ${warn.reason}\nModerator: <@${
              warn.moderatorId
            }>\nDatum: ${warn.timestamp.toDateString()}`,
          });
        });
      }

      return embed;
    };

    const generateButtons = (currentPage, totalPages) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_page")
          .setLabel("Vorherige")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next_page")
          .setLabel("Nächste")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );
    };

    const warningsEmbed = await generateWarningsEmbed(page);
    const totalWarnings = await WarnLog.countDocuments({ userId: user.id });
    const totalPages = Math.ceil(totalWarnings / warningsPerPage);
    const buttons = generateButtons(page, totalPages);

    const selectMenu = interaction.message.components[0];

    await interaction.update({
      embeds: [warningsEmbed],
      components: [selectMenu, buttons],
    });

    const filter = (i) =>
      (i.customId === "prev_page" || i.customId === "next_page") &&
      i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev_page") {
        page = Math.max(0, page - 1);
      } else if (i.customId === "next_page") {
        page = Math.min(totalPages - 1, page + 1);
      }

      const newEmbed = await generateWarningsEmbed(page);
      const newButtons = generateButtons(page, totalPages);

      await i.update({
        embeds: [newEmbed],
        components: [selectMenu, newButtons],
      });
    });

    collector.on("end", () => {
      interaction.editReply({
        components: [selectMenu],
      });
    });
  }
};
