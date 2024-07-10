const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "language_select") return;
  if (interaction.values[0] !== "de") return;

  try {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("REGELN")
      .setDescription(
        "Hier siehst du die regeln. akzeptiere sie bitte mit dem button unten."
      )
      .addFields([
        {
          name: "📃 REGEL 1",
          value:
            "Ein freundlicher und respektvoller Umgang ist jederzeit Pflicht!",
        },
        {
          name: "📃 REGEL 2",
          value:
            "Den Anweisungen von Administratoren (Owner -> Admin -> Moderator) ist stets Folge zu leisten.",
        },
        {
          name: "📃 REGEL 3",
          value: "Fremdwerbung ist verboten.",
        },
        {
          name: "📃 REGEL 4",
          value:
            "Das grundlose taggen / pingen / markieren von Nutzern & Rollen ist untersagt.",
        },
        {
          name: "📃 REGEL 5",
          value:
            "Keine unpassenden Profile (Nutzernamen, Avatare, Accounts und Status). Dazu zählen unter Anderem leere Nutzenamen, ungewöhnliche Unicode Zeichen oder übermäßig lange Nutzernamen.",
        },
        {
          name: "📃 REGEL 6",
          value: "Das Teilen von personenbezogenen Daten ist verboten.",
        },
        {
          name: "📃 REGEL 7",
          value:
            "NSFW-Inhalte (pornografie etc.) sind in allen Channeln verboten.",
        },
        {
          name: "📃 REGEL 8",
          value: "Das Spammen von Nachrichten ist verboten.",
        },
        {
          name: "📃 REGEL 9",
          value: "Trolling ist verboten.",
        },
        {
          name: "📃 REGEL 10",
          value:
            "Halte dich an die Channel Themen und halte Konversationen in den passenden Channeln.",
        },
        {
          name: "📃 REGEL 11",
          value: "Administratoren haben das letzte Wort.",
        },
        {
          name: "📃 REGEL 12",
          value:
            "Das private Anschreiben eines Admins zu Themen die in einem Ticket geklärt werden können ist untersagt",
        },
      ]);

    const button = new ButtonBuilder()
      .setURL(
        "https://acrobat.adobe.com/id/urn:aaid:sc:EU:d4a2dbf1-fdb2-489c-9c51-618a24e1723d"
      )
      .setLabel("INGAME REGELN")
      .setStyle(ButtonStyle.Link);

    const button2 = new ButtonBuilder()
      .setLabel("AKZEPTIEREN")
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
    console.error("Fehler beim Verarbeiten der Deutsch-Auswahl:", error);
    await interaction.reply({
      content: "Es gab einen Fehler bei der Verarbeitung deiner Auswahl.",
      ephemeral: true,
    });
  }
};
