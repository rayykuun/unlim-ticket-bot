const axios = require("axios");
const { DEEPL_API_KEY } = require("./config.json");
async function translateMessage(text, targetLang, sourceLang) {
  try {
    const response = await axios.post(
      "https://api.deepl.com/v2/translate",
      {
        text: [text],
        target_lang: targetLang,
        source_lang: sourceLang,
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.translations[0].text;
  } catch (error) {
    console.error(
      "DeepL API error:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Translation failed");
  }
}

module.exports = { translateMessage };
