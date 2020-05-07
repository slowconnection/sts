const cron = require('node-cron');

//my components/config
const forumAPI = require ('./components/forumAPI');
const googleAPI = require ('./components/googleAPI'); 
const clientDatabase = require('./components/clientDatabase');

const meetingListUrl = 'http://www.britishspeedwaysliders.com/stats/api/getMeetingList.php';
const validWorksheets = ['15 heat','16 heat','heat scorecard','meeting spreadsheet','team summary'];

const app = async () => {

    //get the most recently processed topic_id
    const topic_id = await clientDatabase.getTopicId();

    //step 1:  is the forum showing any new meeting posts?
    const meetingPosts = await forumAPI.getMeetingPosts(`${meetingListUrl}?t=${topic_id}`);
    if(meetingPosts.length > 0) {

      meetingPosts.forEach(async (meetingPost) => {

        //getWorkbookId will return 0 if the workbook is already known
        const workbook_id = await clientDatabase.getWorkbookId({
          spreadsheet_key: meetingPost.spreadsheet_key,
          topic_id: meetingPost.topic_id,
          forum_id: meetingPost.forum_id,
          parent_id: meetingPost.parent_id,
          topic_title: meetingPost.topic_title,
          topic_first_poster_name: meetingPost.topic_first_poster_name,
          topic_time: meetingPost.topic_time //new Date(2020, 04, 01, 3, 24, 0)
        });
      
        if (workbook_id > 0) {
          //Read request to the Google API to acquire a (filtered) list of worksheets in the current workbook
          const worksheets = await googleAPI.listWorksheets({spreadsheetId: meetingPost.spreadsheet_key, validWorksheets});
          
          //iterate and upload these worksheets 
          worksheets.forEach(async (worksheet) => {
            let worksheet_id = await clientDatabase.getWorksheetId({
              workbook_id: workbook_id,
              worksheet_title: worksheet
            });
            //console.log(`worksheet_id = ${worksheet_id}`);

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
      
    } else {
      console.log('No new meetings showing on the forum');
      //consider re-looking at any uploads lacking worksheet and/or cells feed
    }
}

function debug() {
  //let tgt = {spreadsheetId:'1Ezz_MwUX-lGWcJL--h_Ao24gLOj4i5cpu27CYA_RiWA', range:'sheet1!A1:AZ100'};
  //let tgt = {spreadsheetId: '1t4W18_yKrS4YPlKUM_DsWaeW-KhzO_o5dIDLylDIjcs', range:'GP Challenge!A1:AZ100'};
  let tgt = {spreadsheetId: '1juZRubDU9qYPWSaxfWk9og-n3m8BnWOFIyg1uCbnUiU'};
  googleAPI.debugWorkbook(tgt);
}

//debug();

//Execute the app function every 5 minutes
cron.schedule('*/5 * * * *', () => {
  app();
});
