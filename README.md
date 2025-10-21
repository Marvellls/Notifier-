# 📢 Moodle Assignment Discord Notifier Bot

> ⚠️ **Work in Progress**: Deadline extraction feature is currently under development and may not display correctly in all cases.

A Discord bot that automatically scrapes assignments from Moodle-based websites and sends notifications to corresponding Discord channels.

## ✨ Features

- 🔄 Auto-scraping assignments from course pages
- ⏰ Automatic deadline extraction from section descriptions (⚠️ *In Progress*)
- 🔒 Skip locked activities automatically
- 📨 Send notifications to course-specific Discord channels
- 🕐 Scheduled tasks with cron jobs
- 🔁 Retry logic to handle network timeouts
- 💾 Deduplication - prevents duplicate notifications

## 🚀 Setup

### Prerequisites

- Node.js v14 or higher
- Discord Bot Token
- Moodle website account

### Installation

1. Clone this repository:
```bash
git clone https://github.com/Marvellls/Notifier-.git
cd Notifier-
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` and fill in your credentials:
```env
BOT_TOKEN=your_discord_bot_token_here
SERVER_ID=your_discord_server_id_here
WEBSITE_USERNAME=your_username
WEBSITE_PASSWORD=your_password
WEBSITE_URL=https://your-website.com
CRON_SCHEDULE=0 */1 * * *
```

5. Edit `config.js` to match your Moodle website BASE_URL

6. Edit `event-scraper.js` to replace `COURSE_IDS` with your course IDs:
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
The bot will run automatically according to `CRON_SCHEDULE` in `.env` (default: every hour)

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
Edit `COURSE_IDS` in `event-scraper.js`:
```javascript
const COURSE_IDS = [
  { id: YOUR_COURSE_ID, name: 'Your Course Name' },
];
```

### Discord Channels
The bot automatically routes notifications to Discord channels based on course names. Make sure your Discord channel names match the course names (normalized: lowercase, no emoji/symbols).

Examples:
- Course: "Computer Organization" → Discord channel: `#computer-organization`
- Course: "Data Structures" → Discord channel: `#data-structures`

### Cron Schedule
Edit `CRON_SCHEDULE` in `.env`:
- `0 */1 * * *` - Every hour
- `0 9,15,21 * * *` - At 9 AM, 3 PM, 9 PM
- `*/30 * * * *` - Every 30 minutes

## 🛠️ How It Works

1. **Login**: Bot logs into Moodle website using credentials from `.env`
2. **Scraping**: Bot scrapes each course page:
   - Iterates through sections (TOPIK)
   - Extracts deadlines from section descriptions (⚠️ *In Progress - may not work correctly*)
   - Retrieves all activities within sections
   - Skips locked activities
3. **Deduplication**: Compares with previous events (stored in `last-events.json`)
4. **Notification**: Sends to corresponding Discord channel if new events are found
5. **Repeat**: Repeats according to cron schedule

## 📝 Deadline Format (⚠️ In Progress)

The bot attempts to support 2 deadline formats in section descriptions:
1. `sampai DD Month YYYY jam HH:MM`
2. `Tanggal selesai praktikum : DD Month YYYY jam HH:MM`

The bot automatically converts "jam" → "pukul" and appends "WIB" if not present.

**Note**: Deadline extraction is currently unreliable and may not display correctly in all cases.

## 🚧 Known Issues

- **Deadline Extraction**: Currently in progress and may not display correctly in Discord notifications
- Some sections may show "Tidak tersedia" (Not available) for deadlines
- Deadline format parsing needs improvement for various HTML structures

## 🗺️ Roadmap

- [ ] Improve deadline extraction reliability
- [ ] Support more deadline formats
- [ ] Add web dashboard for configuration
- [ ] Multi-language support
- [ ] Enhanced error handling and logging

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Areas that need improvement:
- Deadline extraction logic
- Error handling
- Documentation
- Testing

## 📄 License

MIT

## ⚠️ Disclaimer

This bot is created for educational purposes. Use responsibly and comply with the Terms of Service of the website being scraped.
