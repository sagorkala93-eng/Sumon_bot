const axios = require("axios");

module.exports.config = {
  name: "shorturl",
  version: "1.0.0",
  hasPermssion: 0,
  aliases: ["urlshort", "short"],
  description: "Shorten a URL link",
  commandCategory: "utilities",
  usages: "shorturl <link>",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) 
    return api.sendMessage("❌ Please provide a URL to shorten.\nUsage: shorturl <link>", threadID, messageID);

  const inputUrl = args[0];

  try {
    // Using tinyurl API
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(inputUrl)}`);
    const shortUrl = res.data;

    return api.sendMessage(`🔗 Original URL:\n${inputUrl}\n\n✂️ Shortened URL:\n${shortUrl}`, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to shorten the URL.", threadID, messageID);
  }
};
