//my components/config
const forumAPI = require ('./components/forumAPI');
const googleAPI = require ('./components/googleAPI'); 
const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';
const clientDatabase = require('./components/clientDatabase');

const app = async () => {

    //step 1:  grab URL from BSS forum
    const meetingPosts = await forumAPI.getMeetingPosts(meetingListUrl);

    meetingPosts.forEach(async (meetingPost) => {
      const worksheets = await googleAPI.listWorksheets({spreadsheetId: meetingPost.spreadsheet_key});

      console.log(`Listing worksheets for ${meetingPost.spreadsheet_key} of forum ${meetingPost.forum_id}`, worksheets);
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
    const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ", range:"15 Heat!A1:AZ100"};
    const cellsFeed = await googleAPI.getCellsFeed(tgt);

    console.log('cellsFeed.length = ', cellsFeed.length);

    //step 3:  populate SQL database
    clientDatabase.writeCellsFeed(cellsFeed);

}

//Need to CRON this
app();