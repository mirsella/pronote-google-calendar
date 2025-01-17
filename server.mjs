import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config()
const pronote = require('pronote-api');
const Homeworks = require('./modules/get_homeworks');
import Calendar from "./modules/calendar.mjs";
const userEvents = require('./modules/get_user_events');
const getMarks = require('./modules/get_marks');

//Google Calendar Setup

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(process.env.OAUTH_ID, process.env.OAUTH_SECRET);

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });
const calendar = new google.calendar({version: 'v3',auth: oAuth2Client});



//Config

const username = process.env.PRONOTE_IDF;
const password = process.env.PRONOTE_MDP;
const url = process.env.PRONOTE_URL;

async function main()
{

  const session = await pronote.login(url, username, password/*, cas*/); // Creation of Pronote session

  // would work i don't get rate limited by google :(
  const timetableStart = new Date();
  const timetableEnd = new Date();
  timetableEnd.setDate(timetableEnd.getDate() + 7);
  const timetable = await session.timetable(timetableStart, timetableEnd); // Get timetable of student for 14 days

  // const timetable = await session.timetable(); // Get timetable of student
  const homework = await session.homeworks(); //  Get homeworks of student
  const marks = await session.marks();    //  Get marks of student
  const events = await userEvents.Events(calendar);   //   Get google events of student

  if (timetable.length === 0) return console.log('No lessons planned');

  timetable.forEach((obj) => {

    let homeworks = Homeworks.getHomeworks(homework, obj['subject'], obj['from']);

    let lastMark = getMarks.getMarks(marks, obj['subject']);
    const event = new Calendar(obj['subject'], obj['room'], obj['from'], obj['to'], obj['isCancelled'], obj['teacher'],homeworks !== null ? homeworks : '', events, calendar, lastMark);
    event.createEvent();

  })
}

// Pronote Exception

main().catch(err => {
  if (err.code === pronote.errors.WRONG_CREDENTIALS.code) {
    console.error('Mauvais identifiants');
  } else {
    console.error(err);
    process.exit(1);
  }
});
