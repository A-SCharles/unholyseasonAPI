const mysql = require('mysql')
require('dotenv').config()

var con = mysql.createConnection({
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    multipleStatements: true 
})
 module.exports = con