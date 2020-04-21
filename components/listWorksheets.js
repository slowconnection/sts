const { google } = require("googleapis");
const auth = require("../credentials-load");

async function listWorksheets(tgt) {
    let a = [];
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: tgt.spreadsheetId
    });
    //console.log(res);
    //console.log(res.data.sheets[1].properties.gridProperties);
    res.data.sheets.forEach((s)=>console.log([s.properties.sheetId, s.properties.title, s.properties.gridProperties.rowCount, s.properties.gridProperties.columnCount]));

}
  
module.exports = listWorksheets;