# 📤 Push to GitHub Instructions

## Step 1: Initialize Git (if not already)
```bash
git init
```

## Step 2: Add Remote Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Step 3: Add All Files
```bash
git add .
```

## Step 4: Commit
```bash
git commit -m "feat: Discord bot untuk notifikasi tugas Moodle dengan deadline extraction"
```

## Step 5: Push to GitHub
```bash
git push -u origin main
```

## ✅ Files yang TIDAK akan di-upload (sudah di .gitignore):
- `.env` (credentials)
- `node_modules/` (dependencies)
- `debug_*.html` (debug files)
- `last-events.json` (cache)
- `*.log` (log files)

## 📝 Notes:
1. Pastikan `.env` sudah terisi dengan credentials Anda (file ini TIDAK akan di-push)
2. File `.env.example` akan di-push sebagai template
3. `config.js` sudah menggunakan `WEBSITE_URL` dari `.env` dengan fallback ke `https://your-website.com`
4. Semua URL praktikum.gunadarma.ac.id sudah diganti dengan config system
