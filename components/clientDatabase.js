const sql = require('mssql');

const config = {
    server: 'sts_sql',
    database: 'bss_stats',
    user: 'bss_nodejs_app',
    password: 'bss_nodejs_app',
    port: 1433,
    options: {
        enableArithAbort: true
    }
};

async function getWorkbookId(tgt) {
    //const pool = new sql.ConnectionPool(config);
    const {spreadsheet_key, topic_id, forum_id, parent_id, topic_title, topic_first_poster_name, topic_time} = tgt;
    const conn = await sql.connect(config);
    const request = new sql.Request();
    
    request
        .input('spreadsheet_key', sql.VarChar(40), spreadsheet_key)
        .input('topic_id', sql.Int, topic_id)
        .input('forum_id', sql.Int, forum_id)
        .input('parent_id', sql.Int, parent_id)
        .input('topic_title', sql.VarChar(255), topic_title)
        .input('topic_first_poster_name', sql.VarChar(100), topic_first_poster_name)
        .input('topic_time', sql.DateTime, topic_time);
    
    const workbookResults = await request.execute('upl.getWorkbookId');
    const workbook_id = await workbookResults.recordset[0].workbook_id;

    return workbook_id;
}

async function getWorksheetId(tgt) {
    //const pool = new sql.ConnectionPool(config);
    const {workbook_id, worksheet_title} = tgt;

    await sql.connect(config);
    const request = new sql.Request();

    request
        .input('workbook_id', sql.Int, workbook_id)
        .input('worksheet_title', sql.VarChar(100), worksheet_title);
    
    const worksheetResults = await request.execute('upl.getWorksheetId');
    const worksheet_id = await worksheetResults.recordset[0].worksheet_id;

    return worksheet_id;
        
}

async function getTopicId() {
    //const pool = new sql.ConnectionPool(config);

    await sql.connect(config);
    const request = new sql.Request();

    const worksheetResults = await request.execute('upl.getTopicId');
    const topic_id = await worksheetResults.recordset[0].topic_id;

    return topic_id;
        
}
    

async function writeCellsFeed(workbook_id, worksheet_id, cells) {
    console.log(`writeCellsFeed for workbook(${workbook_id}) and worksheet (${worksheet_id})`);
    const pool = new sql.ConnectionPool(config);
    
    pool.connect(function (err) {

        let recordsAdded = 0;

        const table = new sql.Table('upl.CellsFeed');
        table.create = true;
        table.columns.add('workbook_id', sql.Int);
        table.columns.add('worksheet_id', sql.Int);
        table.columns.add('rowid', sql.SmallInt);
        table.columns.add('colid', sql.SmallInt);
        table.columns.add('cellvalue', sql.VarChar(255));

        cells.forEach((cell) => {
            table.rows.add(workbook_id, worksheet_id, cell[0], cell[1], cell[2]);
        });
        
        const sqlRequest = new sql.Request(pool);

        sqlRequest.bulk(table, (err, rowCount) => {
            if(err) {
                console.log('Bulk insert error');
                console.log(err);
                return false;
            }
        });
    });
    return true;
}

module.exports = {
    writeCellsFeed: writeCellsFeed,
    getWorkbookId: getWorkbookId,
    getWorksheetId: getWorksheetId,
    getTopicId: getTopicId
};