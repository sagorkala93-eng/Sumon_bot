const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "mix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SAGOR",
  description: "Mix two emojis together",
  commandCategory: "fun",
  usages: "emojimix [emoji1] [emoji2]",
  cooldowns: 5
};

function isValidEmoji(str) {
  const regex = /\p{Emoji}/u;
  return regex.test(str);
}

function formatFont(text) {
  return `✨ ${text}`;
}

module.exports.run = async ({ api, event, args }) => {
  try {
    const { threadID, messageID } = event;
    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const pathPic = path.join(cacheDir, `${timestamp}_emojimix.png`);

    if (args.length < 2) {
      return api.sendMessage(formatFont("Please provide two emojis to mix. 🥲"), threadID, messageID);
    }

    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!isValidEmoji(emoji1) || !isValidEmoji(emoji2)) {
      return api.sendMessage(formatFont("❌ Invalid emojis provided. Please provide valid emojis."), threadID, messageID);
    }

    const { data } = await axios.get(
      `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`
    );

    if (!data.results || data.results.length === 0) {
      return api.sendMessage("❌ No combination found for these emojis.", threadID, messageID);
    }

    const imageUrl = data.results[0].media_formats.png_transparent.url;

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(pathPic, Buffer.from(response.data, "utf-8"));

    api.sendMessage(
      {
        body: `🔗 Emoji Mix: ${emoji1} + ${emoji2}`,
        attachment: fs.createReadStream(pathPic)
      },
      threadID,
      () => fs.unlinkSync(pathPic),
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Error while mixing emojis.", event.threadID, event.messageID);
  }
};
