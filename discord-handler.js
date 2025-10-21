// File: discord-handler.js
require('dotenv').config();
const { BASE_URL } = require('./config');

function normalizeName(name) {
  // Hapus semua emoji, simbol, dan whitespace di seluruh nama
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // hapus semua simbol/emoji
    .trim()
    .replace(/\s+/g, '-');
}

function createEventEmbed(event) {
    const eventName = event.name;
    const courseName = event.courseName || event.course?.fullname || event.courseid || 'Unknown';
    const eventUrl = event.viewurl || BASE_URL;
    let deadline = '';
    if (event.deadline) {
      deadline = event.deadline;
    } else if (event.timestart) {
      deadline = new Date(event.timestart * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    } else {
      deadline = 'Tidak tersedia';
    }
    return {
        title: `Notifikasi Tugas: ${eventName}`,
        color: 0x5865F2,
        fields: [
            { name: 'Mata Kuliah', value: String(courseName) },
            { name: 'Deadline', value: deadline },
            { name: 'Link', value: `[Klik di sini](${eventUrl})` }
        ],
        timestamp: new Date(),
        footer: { text: 'Automated Notification Bot' }
    };
}

async function sendNotification(client, eventData) {
  try {
  const guild = await client.guilds.fetch(process.env.SERVER_ID);
  if (!guild) return console.error(`Server dengan ID ${process.env.SERVER_ID} tidak ditemukan.`);

    // Ambil nama course dari courseName (hasil scraping) atau fallback ke course.fullname
    let courseNameFromApi = eventData.courseName || eventData.course?.fullname || eventData.courseid || 'Unknown';
    if (typeof courseNameFromApi === 'string' && courseNameFromApi.includes('|')) {
      courseNameFromApi = courseNameFromApi.split('|').pop().trim();
    }
    const normalizedCourseName = normalizeName(String(courseNameFromApi));

    const targetChannel = guild.channels.cache.find(
      channel => normalizeName(channel.name) === normalizedCourseName
    );

    let channelToSend = targetChannel;
    if (!channelToSend) {
      // Cari channel 'general' atau channel text pertama
      channelToSend = guild.channels.cache.find(
        channel => channel.type === 0 && normalizeName(channel.name) === 'general'
      );
      if (!channelToSend) {
        channelToSend = guild.channels.cache.find(channel => channel.type === 0);
      }
      if (channelToSend) {
        console.warn(`Channel spesifik tidak ditemukan, mengirim ke #${channelToSend.name}`);
      } else {
        console.error('Tidak ada channel text yang bisa dikirim!');
        return;
      }
    }
    const embedMessage = createEventEmbed(eventData);
    await channelToSend.send({ embeds: [embedMessage] });
    console.log(`Pesan untuk "${courseNameFromApi}" berhasil dikirim ke #${channelToSend.name}`);
  } catch (error) {
    console.error(`Gagal mengirim notifikasi untuk ${eventData.name}:`, error);
  }
}

module.exports = { sendNotification };