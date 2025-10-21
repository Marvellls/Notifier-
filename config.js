// Website configuration
// Replace with your Moodle-based website URL
const BASE_URL = process.env.WEBSITE_URL || 'https://your-website.com';

module.exports = {
  BASE_URL,
  LOGIN_URL: `${BASE_URL}/login/index.php`,
  DASHBOARD_URL: `${BASE_URL}/my/`,
  API_URL: (sesskey) => `${BASE_URL}/lib/ajax/service.php?sesskey=${sesskey}`,
  COURSE_URL: (courseId) => `${BASE_URL}/course/view.php?id=${courseId}`,
  CALENDAR_URL: `${BASE_URL}/calendar/view.php`
};
