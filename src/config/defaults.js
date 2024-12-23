
require("dotenv").config();

const config = {
  LOCAL_CLIENT: process.env.LOCAL_CLIENT,
  CLIENT: process.env.CLIENT,
  SRTIPE_KEY: process.env.SRTIPE_KEY,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  DATABASE_LOCAL: process.env.DATABASE_LOCAL,
  DATABASE_LOCAL_USERNAME: process.env.DATABASE_LOCAL_USERNAME,
  DATABASE_LOCAL_PASSWORD: process.env.DATABASE_LOCAL_PASSWORD,
  DATABASE_PROD: process.env.DATABASE_PROD,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_EMAIL: process.env.MAIL_EMAIL,
  SERVER_IP: process.env.SERVER_IP,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  MAIL_GUN_DOMAIN: process.env.MAIL_GUN_DOMAIN,
  MAIL_GUN_API: process.env.MAIL_GUN_API,
  SMTP_MAIL: process.env.SMTP_MAIL,
  PHONE_NUMBER: process.env.PHONE_NUMBER,
  AUTH_TOKEN: process.env.AUTH_TOKEN,
  ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER,
  // SERVER_SECRET: process.env.SERVER_SECRET,
  // APP_ID: process.env.APP_ID,
};

module.exports = Object.freeze(config);
