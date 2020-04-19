const sql = require('mssql');

const config = {
    server: 'localhost',
    database: 'STSlive_D520',
    user: 'bss_stats',
    password: 'bss_stats',
    port: 1433
};

function pushToSQL(cells) {
    const pool = new sql.ConnectionPool(config);
    
    pool.connect(function (err) {

        let recordsAdded = 0;

        const table = new sql.Table('dbo.tblTest');
        table.create = true;
        table.columns.add('rowid', sql.Int);
        table.columns.add('colid', sql.Int);
        table.columns.add('contents', sql.VarChar(255));

        cells.forEach((cell) => {
            table.rows.add(cell[0], cell[1], cell[2]);
            //console.log(cell.length);
        });
        //console.log(`${table.rows} rows added to sql.Table object`);
        
        //console.log(table.rows);
        
        const sqlRequest = new sql.Request(pool);

        sqlRequest.bulk(table, (err, rowCount) => {
            if(err) {
                console.log('Bulk insert error');
                console.log(err);
            }
        });
    });
}

function readSQL() {
    sql.connect(config, function(err) {
        if(err) console.log(err);

        let sqlRequest = new sql.Request();

        let sqlQuery = "select * from tblMeetings where meetingid > 100";
        sqlRequest.query(sqlQuery, function(err,data) {
            if(err) console.log(err);

            console.table(data.recordset);

            sql.close();
        });
    });
}


module.exports = pushToSQL;