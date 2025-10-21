# 📢 Moodle Assignment Discord Notifier Bot

Discord bot yang secara otomatis scraping tugas dari website berbasis Moodle dan mengirim notifikasi ke Discord channel yang sesuai.

## ✨ Features

- 🔄 Auto-scraping tugas dari course pages
- ⏰ Ekstraksi deadline otomatis dari deskripsi section
- 🔒 Skip tugas yang terkunci (locked activities)
- 📨 Kirim notifikasi ke Discord channel spesifik per course
- 🕐 Scheduled task dengan cron job
- 🔁 Retry logic untuk handle network timeout
- 💾 Deduplication - tidak kirim notifikasi duplikat

## 🚀 Setup

### Prerequisites

- Node.js v14 atau lebih tinggi
- Discord Bot Token
- Akun Moodle website

### Installation

1. Clone repository ini:
```bash
git clone <your-repo-url>
cd Notifier
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` dan isi dengan credentials Anda:
```env
BOT_TOKEN=your_discord_bot_token_here
SERVER_ID=your_discord_server_id_here
WEBSITE_USERNAME=your_username
WEBSITE_PASSWORD=your_password
WEBSITE_URL=https://your-website.com
CRON_SCHEDULE=0 */1 * * *
```

5. Edit `config.js` untuk menyesuaikan BASE_URL dengan website Moodle Anda

6. Edit `event-scraper.js` untuk mengganti `COURSE_IDS` dengan course ID dari website Anda:
```javascript
const COURSE_IDS = [
  { id: 29, name: 'Course Name 1' },
  { id: 2, name: 'Course Name 2' },
  { id: 24, name: 'Course Name 3' }
];
```

## 📖 Usage

### Run Once
```bash
node run-bot.js
```

### Run with Cron (Auto-scheduled)
Bot akan jalan otomatis sesuai `CRON_SCHEDULE` di `.env` (default: setiap jam)

## 🏗️ Project Structure

```
Notifier/
├── config.js              # Website URL configuration
├── discord-handler.js     # Discord message handling & channel routing
├── event-scraper.js       # Scraping logic untuk tugas & deadline
├── event-storage.js       # JSON storage untuk deduplication
├── login-scraper.js       # Login automation ke Moodle
├── run-bot.js            # Main entry point dengan cron scheduler
├── .env                  # Environment variables (NOT in repo)
├── .env.example          # Template untuk .env
├── package.json          # Dependencies
└── README.md             # Documentation
```

## 🔧 Configuration

### Course IDs
Edit `COURSE_IDS` di `event-scraper.js`:
```javascript
const COURSE_IDS = [
  { id: YOUR_COURSE_ID, name: 'Your Course Name' },
];
```

### Discord Channels
Bot otomatis routing notifikasi ke channel Discord berdasarkan nama course. Pastikan nama channel di Discord match dengan nama course (normalized: lowercase, no emoji/symbols).

Contoh:
- Course: "Organisasi Sistem Komputer" → Discord channel: `#organisasi-sistem-komputer`
- Course: "Struktur Data" → Discord channel: `#struktur-data`

### Cron Schedule
Edit `CRON_SCHEDULE` di `.env`:
- `0 */1 * * *` - Setiap jam
- `0 9,15,21 * * *` - Jam 9 pagi, 3 sore, 9 malam
- `*/30 * * * *` - Setiap 30 menit

## 🛠️ How It Works

1. **Login**: Bot login ke Moodle website dengan credentials dari `.env`
2. **Scraping**: Bot scraping setiap course page:
   - Iterate melalui sections (TOPIK)
   - Extract deadline dari deskripsi section
   - Ambil semua activities dalam section
   - Skip activities yang locked
3. **Deduplication**: Compare dengan events sebelumnya (stored in `last-events.json`)
4. **Notification**: Kirim ke Discord channel yang sesuai jika ada event baru
5. **Repeat**: Ulangi sesuai cron schedule

## 📝 Deadline Format

Bot support 2 format deadline di deskripsi section:
1. `sampai DD Month YYYY jam HH:MM`
2. `Tanggal selesai praktikum : DD Month YYYY jam HH:MM`

Bot otomatis convert "jam" → "pukul" dan append "WIB" jika belum ada.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

MIT

## ⚠️ Disclaimer

Bot ini dibuat untuk tujuan edukasi. Gunakan dengan bijak dan patuhi Terms of Service website yang di-scrape.
