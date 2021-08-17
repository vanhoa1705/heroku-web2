const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "db4free.net",
    user: "izzy1705",
    password: "vanhoa00",
    database: "izzy1705",
    port: 3306,
  },
  pool: { min: 0, max: 50 },
});

module.exports = knex;
