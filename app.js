const MeetingData = require ('./components/getSS');
const fetch = require('node-fetch');
const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';
const PushSQL = require('./components/writeSQL');

const app = async () => {
    //step 1:  grab URL from BSS forum
    const response = await fetch(meetingListUrl);
    const meetings = await response.json();
    
    //iterate the list of meetings and pull key fields for (a) SQL and (b) Google API
    meetings.forEach((meeting) => {
      //meeting.topic_id
      //meeting.topic_time
      //meeting.topic_title
      //meeting.topic_first_poster_name
      //meeting.post_text
      
      //identify the SS URLs (needs refining so that only the spreadsheets one is captured)
      let postedUrls = meeting.post_text.match(/\bhttps?:\/\/\S+/gi);
      let spreadsheetUrl = postedUrls.map((url) => url.indexOf('/spreadsheets/')>0 ? url : '');
      //console.log(meeting.topic_id, meeting.topic_title, meeting.topic_first_poster_name, spreadsheetUrl);
    });
        

    //step 2:  populate array from the meeting SS using Google API
      //challenge: worksheet(s) may vary in the various templates
    const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ", range:"15 Heat!A1:AO44"};
    const arr = await MeetingData(tgt);

    console.log('arr.length = ', arr.length);

    //step 3:  populate SQL database
    console.log('starting mssql');
    PushSQL(arr);

    console.log('ending mssql');

}

//Need to CRON this
app();