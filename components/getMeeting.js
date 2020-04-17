const { google } = require("googleapis");
const auth = require("../credentials-load");

const getMeeting = async (tgt) => {
    let a = [];
    console.log(`getData({${tgt.spreadsheetId}, ${tgt.range}})`);
    //create sheets client
    const sheets = google.sheets({ version: "v4", auth });
    //get a range of values
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: tgt.spreadsheetId, 
      range: tgt.range 
    })
    .then((res) => {
        res.data.values.forEach((rowitem, rowindex) => {
          rowitem.forEach((colitem, colindex) => {
            if(colitem !== "") a.push(rowindex, colindex, colitem);
          });
        })
      }
    )
    .then(() => {
      console.log('a', a);
      return a;
    })
    .catch()
    ;
  
  }
  
  module.exports = getMeeting;

  