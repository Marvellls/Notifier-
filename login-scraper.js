// File: login-scraper.js
const axios = require("axios").default;
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const { LOGIN_URL, DASHBOARD_URL } = require('./config');

async function loginToWebsite(username, password) {
  console.log('Mencoba login...');
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar }));

  const loginPage = await client.get(LOGIN_URL);
  const logintoken = loginPage.data.match(/name="logintoken" value="([^"]+)"/)?.[1];
  if (!logintoken) throw new Error("Gagal mengambil logintoken.");

  await client.post(
    LOGIN_URL,
    new URLSearchParams({ username, password, logintoken }),
    { maxRedirects: 0, validateStatus: (status) => status < 400 }
  );

  const dashboard = await client.get(DASHBOARD_URL);
  const sesskey = dashboard.data.match(/"sesskey":"([a-zA-Z0-9]+)"/)?.[1];
  if (!sesskey) throw new Error("Login gagal, sesskey tidak ditemukan. Cek kredensial Anda.");

  const cookieString = await jar.getCookieString(DASHBOARD_URL);
  console.log("Login berhasil, semua cookie sesi telah diambil.");
  
  return { cookieString, sesskey };
}

module.exports = { loginToWebsite };