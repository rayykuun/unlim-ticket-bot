const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;
  const validButtonIds = ["select_ase", "select_asa", "reset_gamemode"];
  if (!validButtonIds.includes(interaction.customId)) return;

  const aseRoleId = "1188598586544504843"; // Ihre tatsächliche ASE-Rollen-ID
  const asaRoleId = "1211393369004052491"; // Ihre tatsächliche ASA-Rollen-ID

  try {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const aseRole = interaction.guild.roles.cache.get(aseRoleId);
    const asaRole = interaction.guild.roles.cache.get(asaRoleId);

    if (!aseRole || !asaRole) {
      return interaction.editReply(
        "Es gab ein Problem beim Finden der Rollen. Bitte kontaktiere einen Administrator."
      );
    }

    // Überprüfen Sie die Bot-Berechtigungen
    const botMember = interaction.guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has("ManageRoles")) {
      return interaction.editReply(
        "Der Bot hat nicht die erforderlichen Berechtigungen, um Rollen zu verwalten. Bitte kontaktiere einen Administrator."
      );
    }

    // Überprüfen Sie die Rollenhierarchie
    if (
      botMember.roles.highest.comparePositionTo(aseRole) <= 0 ||
      botMember.roles.highest.comparePositionTo(asaRole) <= 0
    ) {
      return interaction.editReply(
        "Die Bot-Rolle ist nicht hoch genug in der Rollenhierarchie. Bitte kontaktiere einen Administrator."
      );
    }

    const embed = new EmbedBuilder().setColor("#0099ff");

    switch (interaction.customId) {
      case "select_ase":
        if (member.roles.cache.has(aseRoleId)) {
          await member.roles.remove(aseRole);
          embed.setDescription(
            "Die Rolle für ARK: Survival Evolved wurde entfernt."
          );
        } else {
          await member.roles.add(aseRole);
          embed.setDescription(
            "Du hast die Rolle für ARK: Survival Evolved erhalten."
          );
        }
        break;

      case "select_asa":
        if (member.roles.cache.has(asaRoleId)) {
          await member.roles.remove(asaRole);
          embed.setDescription(
            "Die Rolle für ARK: Survival Ascended wurde entfernt."
          );
        } else {
          await member.roles.add(asaRole);
          embed.setDescription(
            "Du hast die Rolle für ARK: Survival Ascended erhalten."
          );
        }
        break;

      case "reset_gamemode":
        let removedRoles = [];
        if (member.roles.cache.has(aseRoleId)) {
          await member.roles.remove(aseRole);
          removedRoles.push("ARK: Survival Evolved");
        }
        if (member.roles.cache.has(asaRoleId)) {
          await member.roles.remove(asaRole);
          removedRoles.push("ARK: Survival Ascended");
        }
        if (removedRoles.length > 0) {
          embed.setDescription(
            `Deine Spielmodus-Auswahl wurde zurückgesetzt. Entfernte Rollen: ${removedRoles.join(
              ", "
            )}`
          );
        } else {
          embed.setDescription(
            "Du hattest keine Spielmodus-Rollen zum Zurücksetzen."
          );
        }
        break;

      default:
        return interaction.editReply("Ungültige Button-Interaktion.");
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Fehler bei der Spielmodus-Auswahl:", error);
    await interaction.editReply(
      "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut oder kontaktiere einen Administrator."
    );
  }
};
