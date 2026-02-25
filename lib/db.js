import mysql from "mysql2/promise";

// Langsung masukin datanya di sini, gak usah pake process.env dulu buat ngetes!
export const db = mysql.createPool({
  host: "mysql-3d5321cd-mountaryidn.h.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_ho5aCdiUgfRRKAE1bxC",
  database: "defaultdb",
  port: 28299,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});