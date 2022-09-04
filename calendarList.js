require('dotenv').config()
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(process.env.OAUTH_ID, process.env.OAUTH_SECRET);

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });
const calendar = new google.calendar({version: 'v3',auth: oAuth2Client});

async function main() {

  // Do the magic
  const res = await calendar.calendarList.list()
  console.log(res.data);
}

main().catch(e => {
  console.error(e);
  throw e;
});
