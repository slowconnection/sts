const listWS = require ('./components/listWorksheets'); 
const getMeetingData = require ('./components/getSS'); 
const fetch = require('node-fetch');
const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';
const PushSQL = require('./components/writeSQL');

async function getMeetings() {
  console.log('getMeetings');
  //step 1:  grab URL from BSS forum
  const response = await fetch(meetingListUrl);
  const meetings = await response.json();
  const spreadsheets = [];

  //iterate the list of meetings and pull key fields for (a) SQL and (b) Google API
  meetings.forEach((meeting) => {
    //identify the SS URLs (needs refining so that only the spreadsheets one is captured)
    let postedUrls = meeting.post_text.match(/\bhttps?:\/\/\S+/gi);
    let spreadsheetUrl = postedUrls.map((url) => url.indexOf('/spreadsheets/')>0 ? url : '');

    spreadsheetUrl.forEach((s) => {
      let a = s.split('/');
      if(a[3]==='spreadsheets') {
        spreadsheets.push({
            topic_id: meeting.topic_id,
            topic_title: meeting.topic_title,
            topic_time: meeting.topic_time,
            topic_first_poster_name: meeting.topic_first_poster_name,
            spreadsheet_key: a[5]
        })
      }
    });
    
  });

  return spreadsheets;
}

const app = async () => {

    //step 1:  grab URL from BSS forum
    const spreadsheets = await getMeetings();

    spreadsheets.forEach(async (s) => {
      const ws = await listWS({spreadsheetId: s.spreadsheet_key});
      console.log(`Listing worksheets for ${s.spreadsheet_key}`, ws);
    });
    
    
    //step 1b: iterate the array from step 1 and ascertain which, if any, are not yet in SQL.
    //console.log(spreadsheets);

    //step 1c: list all worksheets in the target workbook
    //const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ"};
    //spreadsheets.forEach((spreadsheet) => {
    //  const ws = await listWS({spreadsheetId: spreadsheet.spreadsheet_key});
    //});
    

    //step 2:  populate array from the meeting SS using Google API
    //challenge: worksheet(s) may vary in the various templates
    const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ", range:"15 Heat!A1:AO44"};
    const arr = await getMeetingData(tgt);

    console.log('arr.length = ', arr.length);

    //step 3:  populate SQL database
    PushSQL(arr);

}

//Need to CRON this
app();