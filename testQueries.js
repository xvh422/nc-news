const db = require("./db/connection.js");

const table = "comments"

db.query(`SELECT * FROM ${table}`).then((response) => {
  console.log(`${table} >>>>`, response.rows);
});
