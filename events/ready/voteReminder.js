const cron = require("node-cron");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = (c, client, handler) => {
  function sendEmbedMessage(channelId) {
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("VOTE ERINNERUNG")
        .setFooter({
          text: "Tägliche Vote erinnerung um 08:00 Uhr und um 20:00 Uhr",
        })
        .setImage(
          "https://cdn.discordapp.com/attachments/1225532697280250008/1263179173753520128/DALLE_2024-07-17_19.00.50_-_A_banner_with_the_text_VOTE_featuring_the_colors_purple_black_blue_and_white._The_design_should_be_modern_and_visually_appealing_with_the_text_p.webp?ex=66994ac7&is=6697f947&hm=d870d75a18b0dc49c8d013b5d20aa87bf87e73b1545c1a7be2cde368be5f83e9&"
        )
        .setDescription(
          "**Na heute schon gevotet?**\n" +
            "**Nein?** Dann aber schnell!!!!💨\n" +
            "Es warten am Ende des Monats tolle Belohnungen auf dich🎁.\n" +
            "Klicke auf den Button unten um direkt zur Vote-Seite zu kommen.\n\n" +
            "Klicke unten auf den Button **ERINNER MICH** um eine Erinnerung zu erhalten."
        );

      const voteButton = new ButtonBuilder()
        .setLabel("Vote")
        .setURL("https://ps4-arkserver.de/server/1711")
        .setStyle(ButtonStyle.Link);

      const reminderButton = new ButtonBuilder()
        .setCustomId("vote_reminder")
        .setLabel("ERINNER MICH")
        .setEmoji("🔔")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(
        voteButton,
        reminderButton
      );

      channel.send({ embeds: [embed], components: [row] });
      const roleId = "1225463737817894985"; // Ersetzen Sie dies mit der ID der Rolle, die Sie markieren möchten
      channel.send({
        content: `<@&${roleId}>`,
        embeds: [embed],
        components: [row],
      });
    }
  }

  cron.schedule("* 8,20 * * *", () => {
    const channel1Id = "1179837037466103868";
    const channel2Id = "990770199286390855";

    sendEmbedMessage(channel1Id);
    sendEmbedMessage(channel2Id);
  });

  console.log("Scheduled messages set up successfully.");
};
