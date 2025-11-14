import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const migrate = async () => {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    multipleStatements: true,
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    console.error('Database connection details are not configured in your .env file.');
    console.error('Please configure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.');
    process.exit(1);
  }

  let connection;
  try {
    // Connect without specifying a database first to create it if it doesn't exist.
    connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.end();

    // Now connect to the specific database to run the schema.
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database.');

    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Error during database schema creation:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
};

migrate();
