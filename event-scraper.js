const axios = require('axios');
const cheerio = require('cheerio');
const { COURSE_URL, DASHBOARD_URL, API_URL, CALENDAR_URL, BASE_URL } = require('./config');

// List courseid yang ingin di-scrape
const COURSE_IDS = [
  { id: 29, name: 'Organisasi Sistem Komputer' },
  { id: 2, name: 'Struktur Data' },
  { id: 24, name: 'Teknik Pemrograman Terstruktur 1' }
];

async function fetchAssignments({ cookieString }) {
  const headers = {
    "Cookie": cookieString,
    "User-Agent": "Mozilla/5.0"
  };
  let allAssignments = [];
  for (const course of COURSE_IDS) {
    const url = COURSE_URL(course.id);
    
    // Retry logic untuk handle timeout
    let retries = 3;
    let response;
    
    while (retries > 0) {
      try {
        response = await axios.get(url, { 
          headers,
          timeout: 60000, // 60 detik timeout (increased from 30)
          maxRedirects: 5
        });
        break; // Berhasil, keluar dari loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error(`Gagal scrape course ${course.id} setelah beberapa percobaan:`, error.message);
          continue; // Skip course ini, lanjut ke course berikutnya
        }
        console.log(`Retry scraping course ${course.id}, sisa percobaan: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 detik sebelum retry
      }
    }
    
    if (!response) continue; // Skip jika gagal semua retry
    
    try {
      const $ = cheerio.load(response.data);
      
      console.log(`\n=== Scraping course: ${course.name} ===`);
      
      const allAssignmentsFromCourse = [];
      let skippedCount = 0;
      
      // Strategy: Iterate through sections (TOPIK), extract deadline from description,
      // then assign that deadline to all activities within that section
      $('li.section').each((sectionIdx, sectionEl) => {
        const $section = $(sectionEl);
        const sectionName = $section.find('.sectionname').text().trim();
        
        // Skip jika bukan section topik
        if (!sectionName || !sectionName.includes('TOPIK')) {
          return;
        }
        
        // Extract deadline dari description section ini
        const sectionDescription = $section.find('.description-inner').html() || '';
        
        // Regex yang handle berbagai format termasuk HTML entities dan special characters
        // Match: "Tanggal selesai praktikum : 09 November 2025 jam 23:59 WIB"
        // atau: "sampai 09 November 2025 jam 23:59"
        let sectionDeadline = null;
        
        // Try format: "Tanggal selesai praktikum"
        let match = sectionDescription.match(/Tanggal\s+selesai\s+praktikum[^>]*?:\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}\s+jam\s+[0-9]{2}:[0-9]{2})/i);
        if (match) {
          sectionDeadline = match[1].replace(/jam/i, 'pukul');
          if (!sectionDeadline.includes('WIB')) {
            sectionDeadline += ' WIB';
          }
        }
        
        // Try format: "sampai DD Month YYYY jam HH:MM" (untuk Organisasi Sistem Komputer)
        if (!sectionDeadline) {
          match = sectionDescription.match(/sampai\s+([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}\s+jam\s+[0-9]{2}:[0-9]{2})/i);
          if (match) {
            sectionDeadline = match[1].replace(/jam/i, 'pukul') + ' WIB';
          }
        }
        
        console.log(`Section: ${sectionName}, Deadline: ${sectionDeadline || 'No deadline'}`);
        
        // Ambil semua activity dalam section ini
        $section.find('.activity-item').each((actIdx, actEl) => {
          const $act = $(actEl);
          const activityName = $act.attr('data-activityname');
          
          if (!activityName || !/prelab|lab activity/i.test(activityName)) {
            return;
          }
          
          // Cek apakah locked
          const isLocked = $act.find('.availabilityinfo:contains("Not available")').length > 0;
          
          // Skip jika terkunci
          if (isLocked) {
            console.log(`  - ${activityName}: 🔒 Terkunci (skipped)`);
            skippedCount++;
            return;
          }
          
          const courseUrl = COURSE_URL(course.id);
          const displayDeadline = sectionDeadline || 'Tidak tersedia';
          
          console.log(`  - ${activityName}: ${displayDeadline}`);
          allAssignmentsFromCourse.push({
            name: activityName.trim(),
            courseName: course.name,
            deadline: displayDeadline,
            viewurl: courseUrl
          });
        });
      });
      
      console.log(`\n📊 Summary ${course.name}: ${allAssignmentsFromCourse.length} tugas available, ${skippedCount} terkunci (skipped)\n`);
      
      allAssignments.push(...allAssignmentsFromCourse);
    } catch (err) {
      console.error(`Gagal scrape course ${course.id}:`, err.message);
    }
  }
  return allAssignments;
}

async function fetchCourseIds({ cookieString }) {
  const headers = {
    "Cookie": cookieString,
    "User-Agent": "Mozilla/5.0"
  };
  const response = await axios.get(DASHBOARD_URL, { headers });
  const regex = /course\/view\.php\?id=(\d+)/g;
  const ids = new Set();
  let match;
  while ((match = regex.exec(response.data)) !== null) {
    ids.add(Number(match[1]));
  }
  return Array.from(ids);
}

async function fetchEvents({ cookieString, sesskey }) {
  const courseIds = await fetchCourseIds({ cookieString });
  const apiUrl = API_URL(sesskey);
  const now = new Date();
  const headers = {
    "Content-Type": "application/json",
    "Cookie": cookieString,
    "User-Agent": "Mozilla/5.0",
    "Referer": CALENDAR_URL
  };
  let allEvents = [];
  // Ambil 3 bulan terakhir (bisa diubah sesuai kebutuhan)
  for (let offset = 0; offset < 3; offset++) {
    let d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    for (const courseid of courseIds) {
      const payload = [{
        index: 0,
        methodname: "core_calendar_get_calendar_monthly_view",
        args: { year, month, courseid }
      }];
      try {
        const response = await axios.post(apiUrl, payload, { headers });
        const weeks = response.data[0]?.data?.weeks || [];
        weeks.forEach(week => {
          week.days.forEach(day => {
            if (day.events && day.events.length > 0) {
              // Filter hanya prelab dan lab activity
              day.events.forEach(ev => {
                if (/prelab|lab activity/i.test(ev.name)) {
                  // Tambahkan deadline jika ada
                  allEvents.push({
                    ...ev,
                    deadline: ev.timestart ? new Date(ev.timestart * 1000).toISOString() : null
                  });
                }
              });
            }
          });
        });
      } catch (error) {
        console.error(`Gagal ambil event untuk courseid ${courseid} bulan ${month}/${year}:`, error.message);
      }
    }
  }
  // ...existing code...
  // Ambil juga tugas dari halaman course
  const assignments = await fetchAssignments({ cookieString });
  console.log('Assignments:', assignments);
  return assignments;
}

module.exports = { fetchEvents };