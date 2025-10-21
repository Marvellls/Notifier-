// File: run-bot.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const cron = require("node-cron");
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { loginToWebsite } = require('./login-scraper.js');
const { fetchEvents } = require('./event-scraper.js');

const { sendNotification } = require('./discord-handler.js');
const { readLastEvents, saveLastEvents } = require('./event-storage.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

async function mainTask() {
  console.log("Menjalankan tugas pengecekan jadwal...");
  try {
    const { cookieString, sesskey } = await loginToWebsite(process.env.WEBSITE_USERNAME, process.env.WEBSITE_PASSWORD);
  const events = await fetchEvents({ cookieString, sesskey });
    console.log(`Berhasil! Ditemukan ${events.length} acara untuk bulan ini.`);

    const lastEvents = readLastEvents();
    const isSame = JSON.stringify(events) === JSON.stringify(lastEvents);
    if (!isSame) {
      saveLastEvents(events);
      for (const event of events) {
        await sendNotification(client, event);
      }
      console.log('Event baru, notifikasi dikirim.');
    } else {
      console.log('Event masih sama, tidak dikirim ulang.');
    }
  } catch (err) {
    console.error("Tugas utama gagal:", err.message);
  }
}

client.once('clientReady', () => {
  console.log(`Bot ${client.user.tag} sudah online!`);
  mainTask();
  cron.schedule(process.env.CRON_SCHEDULE, mainTask);
  console.log(`Tugas dijadwalkan untuk berjalan sesuai jadwal: "${process.env.CRON_SCHEDULE}"`);
});

client.login(process.env.BOT_TOKEN);