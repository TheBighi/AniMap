require('dotenv').config();

const mysql = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
};

module.exports = {
  development: mysql,
  production: mysql,
  test: { dialect: 'sqlite', storage: ':memory:', logging: false },
};