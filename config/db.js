const mysql = require('mysql2');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',     
  password: '',      
  database: 'webpro_complete'
});


con.connect((err) => {
  if (err) {
    console.error(' Database connection failed: ' + err.stack);
    return;
  }
  console.log(' Connected to MySQL database');
});

module.exports = con;
