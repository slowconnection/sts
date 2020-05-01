const { google } = require("googleapis");
const auth = require("../credentials-load");

async function listAllWorksheets(tgt) {
    let worksheets = [];
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: tgt.spreadsheetId
    });
    //populate array with the a list of all worksheets within the target
    res.data.sheets.forEach((s) => worksheets.push({
      sheetid: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties.rowCount,
      colCount: s.properties.gridProperties.columnCount
    }));

    return worksheets;
                          
  }

  async function listWorksheets(tgt) {
    let worksheets = [];
    const {spreadsheetId, validWorksheets } = tgt;
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });
    res.data.sheets.forEach((s) => {
      worksheets.push(s.properties.title);
    });

    return worksheets.filter(e => validWorksheets.indexOf(e.toLowerCase()) !== -1);
                          
  }

  async function getCellsFeed(tgt) {
    console.log('getCellsFeed');
    let cellsfeed = [];
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: tgt.spreadsheetId, 
      range: tgt.range 
    });
    res.data.values.forEach((rowitem, rowindex) => {
        rowitem.forEach((colitem, colindex) => {
            if(colitem !== "") {
                let cell = [];
                cell[0] = rowindex + 1;
                cell[1] = colindex + 1;
                cell[2] = colitem;

                cellsfeed.push(cell);
            }
        })
    });

    return cellsfeed;
}
  
module.exports = {
  listWorksheets: listWorksheets,
  getCellsFeed: getCellsFeed
};