const { translateMessage } = require("../../translate");

module.exports = async (reaction, user, client) => {
  if (user.bot) return;

  if (reaction.emoji.name === "🇩🇪" || reaction.emoji.name === "🇬🇧") {
    try {
      await reaction.fetch();
      const message = await reaction.message.fetch();
      const targetLanguage = reaction.emoji.name === "🇩🇪" ? "DE" : "EN";
      const sourceLanguage = targetLanguage === "DE" ? "EN" : "DE";

      const translatedText = await translateMessage(
        message.content,
        targetLanguage,
        sourceLanguage
      );

      await reaction.message.reply({
        content: `Translation von: ${sourceLanguage} to ${targetLanguage}: \n${translatedText}`,
        allowedMentions: { repliedUser: false },
      });
      await reaction.users.remove(user);
    } catch (error) {
      console.error("Translation error:", error);
      await reaction.message.channel.send(
        `Translation error occurred. Please try again later.`
      );
    }
  }
};
