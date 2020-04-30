//packages
const fetch = require('node-fetch');

async function getMeetingPosts(url) {
    console.log(`getMeetingPosts ${url}`);
    //step 1:  grab URL from BSS forum
    const response = await fetch(url);
    const meetings = await response.json();
    let spreadsheets = [];
  
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
              forum_id: meeting.forum_id,
              parent_id: meeting.parent_id,
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

  module.exports = {
      getMeetingPosts: getMeetingPosts
  }