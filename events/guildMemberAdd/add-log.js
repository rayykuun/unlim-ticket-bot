const { EmbedBuilder } = require("discord.js");
const { LogChannel, MemberLog } = require("../../mongoSchema");

module.exports = async (member, client, handler) => {
  console.log("member joined event triggered");
  try {
    // Log-Kanal finden
    const logChannel = await LogChannel.findOne({ guildId: member.guild.id });

    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Mitglied beigetreten")
        .addFields(
          { name: "Name", value: member.user.tag },
          { name: "ID", value: member.id },
          {
            name: "Discord beigetreten",
            value: member.user.createdAt.toLocaleString(),
          }
        )
        .setTimestamp();

      const channel = member.guild.channels.cache.get(logChannel.channelId);
      if (channel) {
        await channel.send({ embeds: [embed] });
      }
    }

    // MemberLog in der Datenbank aktualisieren oder erstellen
    let memberLog = await MemberLog.findOne({ userId: member.id });

    if (!memberLog) {
      memberLog = new MemberLog({
        userId: member.id,
        username: member.user.tag,
        discordJoined: member.user.createdAt,
        serverJoins: [
          {
            guildId: member.guild.id,
            joinedAt: new Date(),
          },
        ],
        serverLeaves: [],
      });
    } else {
      memberLog.serverJoins.push({
        guildId: member.guild.id,
        joinedAt: new Date(),
      });
    }

    await memberLog.save();

    const welcomeChannelId = "1260259517753458718"; // Ersetzen Sie dies durch die tatsächliche Channel-ID
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (welcomeChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Willkommen auf unserem Server!")
        .setImage(
          "https://cdn.discordapp.com/attachments/1200530123007479949/1260637990196088892/image.png?ex=66900c1e&is=668eba9e&hm=bdde86066f83bc72e4949cc66e59ae360592418e4697489588bfe31cbf06971d&"
        )
        .setDescription(
          `Hallo ${member},\n` +
            "Bitte lies die Regeln und bestätige diese <#990767701402189824>.\n" +
            "Hast du das erledigt wähle hier <#1180208160376631337> deine Rolle aus was du Spielen möchtest\n" +
            "Damit wir dich auch richtig zu ordnen können mache bitte hier <#1200768896857280622> eine Anmeldung.\n\n" +
            ".Wenn du beim starten im Spiel Hilfe brauchst kannst du dir gerne hier <#1003363731742412821> ein Starter beantragen!" +
            "\n\n\nWir wünschen dir ganz viel Spaß auf unserem Server.🥳"
        )
        .setFooter({
          text: `Mitglied Nr. ${member.guild.memberCount}`,
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

      await welcomeChannel.send({ embeds: [welcomeEmbed] });
    }

    console.log(
      `Mitglied ${member.user.tag} wurde erfolgreich geloggt und begrüßt.`
    );
  } catch (error) {
    console.error(
      "Fehler beim Protokollieren des Mitglied-Beitritts oder Senden der Begrüßung:",
      error
    );
  }
};
