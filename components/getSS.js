const { google } = require("googleapis");
const auth = require("../credentials-load");

async function getMeetingData(tgt) {
    let a = [];
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

                a.push(cell);
            }
        })
    });

    return a;
}
  
module.exports = getMeetingData;

  