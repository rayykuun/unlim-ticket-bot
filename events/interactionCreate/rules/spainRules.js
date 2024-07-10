const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (interaction, client, handler) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "language_select") return;
  if (interaction.values[0] !== "es") return;

  try {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("REGLAS")
      .setDescription(
        "Aquí puedes ver las reglas. Por favor, acéptalas usando el botón de abajo."
      )
      .addFields([
        {
          name: "📃 REGLA 1",
          value:
            "¡El comportamiento amistoso y respetuoso es obligatorio en todo momento!",
        },
        {
          name: "📃 REGLA 2",
          value:
            "Las instrucciones de los administradores (Propietario -> Admin -> Moderador) deben seguirse siempre.",
        },
        {
          name: "📃 REGLA 3",
          value: "La publicidad externa está prohibida.",
        },
        {
          name: "📃 REGLA 4",
          value:
            "No se permite etiquetar / mencionar / marcar innecesariamente a usuarios y roles.",
        },
        {
          name: "📃 REGLA 5",
          value:
            "No se permiten perfiles inapropiados (nombres de usuario, avatares, cuentas y estados). Esto incluye, entre otros, nombres de usuario vacíos, caracteres Unicode inusuales o nombres de usuario excesivamente largos.",
        },
        {
          name: "📃 REGLA 6",
          value: "Está prohibido compartir datos personales.",
        },
        {
          name: "📃 REGLA 7",
          value:
            "El contenido NSFW (pornografía, etc.) está prohibido en todos los canales.",
        },
        {
          name: "📃 REGLA 8",
          value: "Está prohibido el spam de mensajes.",
        },
        {
          name: "📃 REGLA 9",
          value: "El trolleo está prohibido.",
        },
        {
          name: "📃 REGLA 10",
          value:
            "Mantén las conversaciones en los canales apropiados y apégate a los temas de los canales.",
        },
        {
          name: "📃 REGLA 11",
          value: "Los administradores tienen la última palabra.",
        },
        {
          name: "📃 REGLA 12",
          value:
            "No está permitido enviar mensajes privados a un administrador sobre temas que pueden resolverse en un ticket.",
        },
      ]);

    const button = new ButtonBuilder()
      .setURL(
        "https://acrobat.adobe.com/id/urn:aaid:sc:EU:36ccc560-de76-4de1-a5d1-613834835a81"
      )
      .setLabel("REGLAS DEL JUEGO")
      .setStyle(ButtonStyle.Link);

    const button2 = new ButtonBuilder()
      .setLabel("ACEPTAR")
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
    console.error("Error al procesar la selección en español:", error);
    await interaction.reply({
      content: "Hubo un error al procesar tu selección.",
      ephemeral: true,
    });
  }
};
