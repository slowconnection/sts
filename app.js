const Meeting = require ('./components/getMeeting');
const fetch = require('node-fetch');
const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';

const app = () => {
    //step 1:  grab URL from BSS forum
    console.log(`Fetching ${meetingListUrl}`);
    fetch(meetingListUrl)
        .then(response => response.json()) 
        .then((meetings) => {
          //iterate the list of meetings and pull key fields for (a) SQL and (b) Google API
          meetings.forEach((meeting) => {
            //meeting.topic_id
            //meeting.topic_time
            //meeting.topic_title
            //meeting.topic_first_poster_name
            //meeting.post_text
            
            //identify the SS URLs (needs refining so that only the spreadsheets one is captured)
            let ss = meeting.post_text.match(/\bhttps?:\/\/\S+/gi);
            console.log(meeting.topic_id, meeting.topic_title, ss);
          })
        });
        

    //step 2:  populate array from the meeting SS using Google API
      //challenge: worksheet(s) may vary in the various templates
    const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ", range:"15 Heat!A1:AO44"};
    const arr = Meeting(tgt);
    console.log(arr);

    //step 3:  populate SQL database

}

//Need to CRON this
app();