const Pool = require('pg').Pool;

const pool = new Pool({ 
    user: 'postgres',
    host: 'localhost',
    database: 'sittrdatabase',
    password: 'ADMIN',
    port: 5432 

});

module.exports = pool;


