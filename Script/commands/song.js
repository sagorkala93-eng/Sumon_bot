const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "song",
  version: "2.2.0",
  aliases: ["music", "play"],
  credits: "SAGOR",
  description: "Play a YouTube song directly",
  commandCategory: "media",
  usages: "song [song name]",
  cooldowns: 5
};

async function downloadFile(url, pathName) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(pathName, Buffer.from(res.data));
  return fs.createReadStream(pathName);
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage("❌ Please provide a song name.\nUsage: song [song name]", threadID, messageID);
  }

  const query = encodeURIComponent(args.join(" "));
  const baseApi = "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json";

  try {
    const apiRes = await axios.get(baseApi);
    const baseUrl = apiRes.data.api;
    
    const searchRes = await axios.get(`${baseUrl}/ytFullSearch?songName=${query}`);
    const track = searchRes.data?.[0];
    if (!track) return api.sendMessage("❌ No song found for this keyword.", threadID, messageID);
    
    const { data: { title, downloadLink, quality } } = await axios.get(`${baseUrl}/ytDl3?link=${track.id}&format=mp3`);

    const audioPath = path.join(__dirname, "cache", `audio_${senderID}_${Date.now()}.mp3`);
    const stream = await downloadFile(downloadLink, audioPath);

    await api.sendMessage({
      body: `🎵 Title: ${title}\n🔊 Quality: ${quality}`,
      attachment: stream
    }, threadID, () => fs.unlinkSync(audioPath), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch or play the song.", threadID, messageID);
  }
};
