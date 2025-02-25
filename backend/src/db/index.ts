import fs from 'fs';
import pg, { QueryResult, QueryResultRow } from 'pg';
const { Pool } = pg;

const caCert = fs.readFileSync('src/certs/ca-certificate.crt');

const isProduction = process.env.APP_ENV_DB === 'production';

export const pool = new Pool({
  user: isProduction ? process.env.PROD_DB_USER : process.env.DEV_DB_USER,
  password: isProduction ? process.env.PROD_DB_PASSWORD : process.env.DEV_DB_PASSWORD,
  host: isProduction ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST,
  port: isProduction ? parseInt(process.env.PROD_DB_PORT as string) : parseInt(process.env.DEV_DB_PORT as string, 10),
  database: isProduction ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,
  ssl: isProduction ? {
    rejectUnauthorized: true,
    ca: caCert,
  } : undefined,
});

export const dbQuery = async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const client = await pool.connect();
  try {
    await client.query(`SET TIME ZONE 'UTC';`);
    const result = await client.query<T>(text, params);
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/*
create new user 'admin'

connect to db using psql as superuser "connection string"

CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  slots INT NOT NULL,
  location VARCHAR(100) NOT NULL,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL
);

CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  reservation_date DATE NOT NULL,
  address VARCHAR(255) NOT NULL,
  scanned BOOLEAN DEFAULT false NOT NULL,
  reservation_uuid UUID NOT NULL,
  FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

CREATE INDEX idx_lower_email ON reservations (LOWER(email));

SELECT pg_size_pretty(pg_database_size('reservation-system')) AS db_size;
SELECT pg_size_pretty(pg_total_relation_size('idx_lower_email')) AS index_size;

\di

postgresql automatically set names to lowercase if there is no ""

GRANT ALL PRIVILEGES ON DATABASE "reservation-system" TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;
\dp events


-----DB RESET COMMAND----
  -----ALWAYS CHECK WHICH DB YOU ARE CONNECTED--------
    TRUNCATE TABLE Reservations, Events RESTART IDENTITY CASCADE;
-----DB RESET COMMAND----
*/