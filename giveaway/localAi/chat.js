const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { Moderator } = require("../../mongoSchema");

const TRUSTED_URLS = [
  "https://www.curseforge.com/ark-survival-ascended/mods/super-spyglass-plus",
  // Add more trusted URLs here
];

async function fetchWebContent(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    const content = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return content.slice(0, 1000);
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    await browser.close();
    return "";
  }
}

async function fetchRelevantContent(question) {
  let combinedContent = "";
  for (const url of TRUSTED_URLS) {
    const content = await fetchWebContent(url);
    console.log(`Content from ${url}: ${content.substring(0, 100)}...`);
    if (content.toLowerCase().includes(question.toLowerCase())) {
      combinedContent += `From ${url}: ${content}\n\n`;
    }
  }
  console.log(`Collected relevant content: ${combinedContent}`);
  return combinedContent;
}

module.exports = {
  options: {
    devOnly: true,
  },
  data: new SlashCommandBuilder()
    .setName("ask-ai")
    .setDescription("Stellt eine Frage an die lokale LM Studio AI")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Die Frage, die du stellen möchtest")
        .setRequired(true)
    ),

  run: async ({ interaction, client, handler }) => {
    try {
      const moderator = await Moderator.findOne({
        userId: interaction.user.id,
      });
      if (!moderator) {
        return interaction.reply({
          content: "Du hast keine Berechtigung, diesen Befehl zu verwenden.",
          ephemeral: true,
        });
      }

      const question = interaction.options.getString("question");

      await interaction.deferReply();

      const thinkingEmbed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("AI denkt nach")
        .setDescription(
          "CHATGPT Denkt nach, dies kann einen kleinen Moment dauern"
        )
        .setFooter({ text: `Gefragt von ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [thinkingEmbed] });

      const relevantContent = await fetchRelevantContent(question);
      const enhancedPrompt = `Context information:\n${relevantContent}\n\nUser question: ${question}\n\nAnswer the question using ONLY the information provided in the context. If the context does not contain relevant information to answer the question, state that you don't have enough information to provide an answer.`;

      const response = await axios.post(
        "http://localhost:1234/v1/chat/completions",
        {
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that only uses the provided web content to answer questions. Do not use any other knowledge or information beyond what is given in the context.",
            },
            { role: "user", content: enhancedPrompt },
          ],
          temperature: 0.7,
          max_tokens: -1,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      const chunks = [];
      for (let i = 0; i < aiResponse.length; i += 700) {
        chunks.push(aiResponse.slice(i, i + 700));
      }

      const embeds = chunks.map((chunk, index) => {
        return new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle(`AI Antwort (Seite ${index + 1}/${chunks.length})`)
          .addFields(
            {
              name: "Frage",
              value:
                question.length > 700
                  ? `${question.substring(0, 697)}...`
                  : question,
            },
            { name: "Antwort", value: chunk }
          )
          .setFooter({ text: `Gefragt von ${interaction.user.tag}` })
          .setTimestamp();
      });

      let currentPage = 0;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Vorherige")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Nächste")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(chunks.length === 1)
      );

      const message = await interaction.editReply({
        embeds: [embeds[currentPage]],
        components: [row],
      });

      const collector = message.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "previous") {
          currentPage--;
        } else if (i.customId === "next") {
          currentPage++;
        }

        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(currentPage === chunks.length - 1);

        await i.update({
          embeds: [embeds[currentPage]],
          components: [row],
        });
      });

      collector.on("end", () => {
        row.components.forEach((button) => button.setDisabled(true));
        message.edit({ components: [row] });
      });
    } catch (error) {
      console.error("Fehler bei der AI-Anfrage:", error);
      await interaction.editReply({
        content:
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },
};
