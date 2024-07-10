const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "language_select") return;
  if (interaction.values[0] !== "en") return;

  try {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("RULES")
      .setDescription(
        "Here you can see the rules. Please accept them using the button below."
      )
      .addFields([
        {
          name: "📃 RULE 1",
          value: "Friendly and respectful behavior is mandatory at all times!",
        },
        {
          name: "📃 RULE 2",
          value:
            "Instructions from administrators (Owner -> Admin -> Moderator) must always be followed.",
        },
        {
          name: "📃 RULE 3",
          value: "External advertising is prohibited.",
        },
        {
          name: "📃 RULE 4",
          value:
            "Unnecessary tagging / pinging / marking of users & roles is not allowed.",
        },
        {
          name: "📃 RULE 5",
          value:
            "No inappropriate profiles (usernames, avatars, accounts, and status). This includes, among others, empty usernames, unusual Unicode characters, or excessively long usernames.",
        },
        {
          name: "📃 RULE 6",
          value: "Sharing personal data is prohibited.",
        },
        {
          name: "📃 RULE 7",
          value:
            "NSFW content (pornography etc.) is prohibited in all channels.",
        },
        {
          name: "📃 RULE 8",
          value: "Spamming messages is prohibited.",
        },
        {
          name: "📃 RULE 9",
          value: "Trolling is prohibited.",
        },
        {
          name: "📃 RULE 10",
          value:
            "Stick to channel topics and keep conversations in the appropriate channels.",
        },
        {
          name: "📃 RULE 11",
          value: "Administrators have the final say.",
        },
        {
          name: "📃 RULE 12",
          value:
            "Privately messaging an admin about issues that can be resolved in a ticket is not allowed.",
        },
      ]);

    const button = new ButtonBuilder()
      .setURL(
        "https://acrobat.adobe.com/id/urn:aaid:sc:EU:28ac9bd7-3827-46d3-b0cd-4837f69e3ecb"
      )
      .setLabel("IN-GAME RULES")
      .setStyle(ButtonStyle.Link);

    const button2 = new ButtonBuilder()
      .setLabel("ACCEPT")
      .setCustomId("accept_rules")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button, button2);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error processing English selection:", error);
    await interaction.reply({
      content: "There was an error processing your selection.",
      ephemeral: true,
    });
  }
};
