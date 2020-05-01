//my components/config
const forumAPI = require ('./components/forumAPI');
const googleAPI = require ('./components/googleAPI'); 
const clientDatabase = require('./components/clientDatabase');

const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';
const validWorksheets = ['15 heat','16 heat','heat scorecard','meeting spreadsheet','team summary'];

const app = async () => {
    //step 1:  grab URL from BSS forum
    const meetingPosts = await forumAPI.getMeetingPosts(meetingListUrl);

    meetingPosts.forEach(async (meetingPost) => {

      //check if the workbook is already known (prevent unnecessary read request to Google API)
      const workbook_id = await clientDatabase.getWorkbookId({
        spreadsheet_key: meetingPost.spreadsheet_key,
        topic_id: meetingPost.topic_id,
        forum_id: meetingPost.forum_id,
        parent_id: meetingPost.parent_id,
        topic_title: meetingPost.topic_title,
        topic_first_poster_name: meetingPost.topic_first_poster_name,
        topic_time:  new Date(2020, 04, 01, 3, 24, 0)
      });
     
      if (workbook_id > 0) {
        //list all uploadable worksheets
        const worksheets = await googleAPI.listWorksheets({spreadsheetId: meetingPost.spreadsheet_key, validWorksheets});
        
        //iterate and upload these worksheets 
        worksheets.forEach(async (worksheet) => {
          let worksheet_id = await clientDatabase.getWorksheetId({
            workbook_id: workbook_id,
            worksheet_title: worksheet
          });
          console.log(`worksheet_id = ${worksheet_id}`);

          if(worksheet_id !== 0) {
            let tgt = {spreadsheetId:meetingPost.spreadsheet_key, range:`${worksheet}!A1:AZ100`};
            let cellsFeed = await googleAPI.getCellsFeed(tgt);
      
            if(cellsFeed.length > 0) {
              const runSQL = await clientDatabase.writeCellsFeed(workbook_id, worksheet_id, cellsFeed);
            }
          } else {
            console.log(`${worksheet} already exists for workbook ${workbook_id}`);
          }
          
        });
      } else {
        console.log('Workbook already uploaded');
      };
      
    });
    
    
    //step 1b: iterate the array from step 1 and ascertain which, if any, are not yet in SQL.
    //console.log(worksheets);

    //step 1c: list all worksheets in the target workbook
    //const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ"};
    //spreadsheets.forEach((spreadsheet) => {
    //  const ws = await listWS({spreadsheetId: spreadsheet.spreadsheet_key});
    //});
    

    //step 2:  populate array from the meeting SS using Google API
    //challenge: worksheet(s) may vary in the various templates
    //const tgt = {spreadsheetId:"14oNLHaZHUer_i6hp0bnvyDvpNboQHEtQBi54-itLRWQ", range:"15 Heat!A1:AZ100"};
    //const cellsFeed = await googleAPI.getCellsFeed(tgt);

    //step 3:  populate SQL database
    //if(cellsFeed.length > 0) {
    //  const runSQL = await clientDatabase.writeCellsFeed(cellsFeed);
    //}

}

//Need to CRON this
app();