// lib/db.js
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Kosongkan sesuai setelan XAMPP abang
  database: "mountary", // Pastikan nama DB-nya sesuai di phpMyAdmin
  port: 3306,
});

export { db };