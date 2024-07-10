const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "language_select") return;
  if (interaction.values[0] !== "fr") return;

  try {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("RÈGLES")
      .setDescription(
        "Voici les règles. Veuillez les accepter en utilisant le bouton ci-dessous."
      )
      .addFields([
        {
          name: "📃 RÈGLE 1",
          value:
            "Un comportement amical et respectueux est obligatoire à tout moment !",
        },
        {
          name: "📃 RÈGLE 2",
          value:
            "Les instructions des administrateurs (Propriétaire -> Admin -> Modérateur) doivent toujours être suivies.",
        },
        {
          name: "📃 RÈGLE 3",
          value: "La publicité externe est interdite.",
        },
        {
          name: "📃 RÈGLE 4",
          value:
            "Le marquage / ping / mention inutile d'utilisateurs et de rôles n'est pas autorisé.",
        },
        {
          name: "📃 RÈGLE 5",
          value:
            "Pas de profils inappropriés (noms d'utilisateur, avatars, comptes et statuts). Cela inclut, entre autres, les noms d'utilisateur vides, les caractères Unicode inhabituels ou les noms d'utilisateur excessivement longs.",
        },
        {
          name: "📃 RÈGLE 6",
          value: "Le partage de données personnelles est interdit.",
        },
        {
          name: "📃 RÈGLE 7",
          value:
            "Le contenu NSFW (pornographie, etc.) est interdit dans tous les canaux.",
        },
        {
          name: "📃 RÈGLE 8",
          value: "Le spam de messages est interdit.",
        },
        {
          name: "📃 RÈGLE 9",
          value: "Le trolling est interdit.",
        },
        {
          name: "📃 RÈGLE 10",
          value:
            "Respectez les sujets des canaux et gardez les conversations dans les canaux appropriés.",
        },
        {
          name: "📃 RÈGLE 11",
          value: "Les administrateurs ont le dernier mot.",
        },
        {
          name: "📃 RÈGLE 12",
          value:
            "Il est interdit d'envoyer des messages privés à un administrateur pour des problèmes qui peuvent être résolus dans un ticket.",
        },
      ]);

    const button = new ButtonBuilder()
      .setURL(
        "https://acrobat.adobe.com/id/urn:aaid:sc:EU:c103328b-b823-4b99-a302-540e8e0ba4c3"
      )
      .setLabel("RÈGLES DU JEU")
      .setStyle(ButtonStyle.Link);

    const button2 = new ButtonBuilder()
      .setLabel("ACCEPTER")
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
    console.error(
      "Erreur lors du traitement de la sélection française:",
      error
    );
    await interaction.reply({
      content:
        "Une erreur s'est produite lors du traitement de votre sélection.",
      ephemeral: true,
    });
  }
};
