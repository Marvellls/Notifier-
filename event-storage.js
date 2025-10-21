const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, 'last-events.json');

function readLastEvents() {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveLastEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

module.exports = { readLastEvents, saveLastEvents };
