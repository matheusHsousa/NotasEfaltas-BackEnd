import mysql from "mysql2";

// export const db = mysql.createConnection({
//     host: "sql.freedb.tech",
//     user: "freedb_bdnotas-user",
//     password: "w@#Pp8r&A7G7NBS",
//     database: "freedb_bdNotasEfaltas",
//     connectTimeout: 600000000
// });

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "matheus157",
    database: "notas",
});