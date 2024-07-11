import fs from 'fs';
import pg from 'pg';
import { getCurrentDateInGMT8 } from '../helpers/stringHelper.js';
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

export const dbQuery = (text: string, params?: any[]) => pool.query(text, params)

export async function createEvent(eventName: string, slots: number, location: string, startDateTime: string, endDateTime: string) {
  return await pool.query(`
    INSERT INTO Events (event_name, slots, location, start_datetime, end_datetime) VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [eventName, slots, location, startDateTime, endDateTime]);
}

export async function getAvailableEvents() {
  const currentDate = getCurrentDateInGMT8().toISOString();

  return await pool.query(`
    SELECT 
      e.event_id,
      e.event_name,
      e.location,
      e.start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      e.end_datetime AT TIME ZONE 'UTC' AS end_datetime,
      (e.slots - COALESCE(COUNT(r.reservation_id), 0)) AS slots_left
    FROM events e
    LEFT JOIN reservations r ON e.event_id = r.event_id
    WHERE e.end_datetime >= $1
    GROUP BY e.event_id
  `, [currentDate]);
}

export async function getAllEvents() {
  return await pool.query(`
    SELECT 
      e.event_id,
      e.event_name,
      e.slots,
      e.location,
      e.start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      e.end_datetime AT TIME ZONE 'UTC' AS end_datetime,
      (e.slots - COALESCE(COUNT(r.reservation_id), 0)) AS slots_left
    FROM events e
    LEFT JOIN Reservations r ON e.event_id = r.event_id
    GROUP BY e.event_id
  `)
}

export async function getAllEventsWithPage(limit: number, offset: number) {
  const events = await pool.query(`
    SELECT 
      event_id,
      event_name,
      slots,
      location,
      start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      end_datetime AT TIME ZONE 'UTC' AS end_datetime
    FROM events
    ORDER BY event_id
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  const total = await pool.query(`SELECT COUNT(*) FROM events`)
  return { events, total };
}

export async function getEvent(eventID: number) {
  return await pool.query(`
    SELECT 
      event_name,
      location,
      start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      end_datetime AT TIME ZONE 'UTC' AS end_datetime 
    FROM Events WHERE event_id = $1
  `, [eventID])
}

export async function getReservation(eventID: number, reservationID: string) {
  return await pool.query(`
    WITH numbered_reservations AS (
      SELECT 
        reservation_uuid,
        name,
        email,
        mobile_number,
        reservation_date,
        address,
        scanned,
        ROW_NUMBER() OVER (ORDER BY reservation_date ASC, reservation_id ASC) as reservation_number
      FROM reservations
      WHERE event_id = $1
    )
    SELECT 
      name,
      email,
      mobile_number,
      reservation_date,
      address,
      scanned,
      reservation_number
    FROM numbered_reservations WHERE reservation_uuid = $2;
  `, [eventID, reservationID])
}

export async function getReservationsWIthPage(eventId: number, limit: number, offset: number) {
  const reservations = await pool.query(`
      SELECT 
      reservation_id,
      event_id,
      name,
      email,
      mobile_number,
      reservation_date AT TIME ZONE 'UTC' AS reservation_date,
      address,
      scanned,
      reservation_uuid,
      ROW_NUMBER() OVER (ORDER BY reservation_date ASC, reservation_id ASC) as reservation_number 
    FROM reservations 
    WHERE event_id = $1 
    ORDER BY reservation_date ASC, reservation_id ASC 
    LIMIT $2 OFFSET $3
  `, [eventId, limit, offset]);
  const total = await pool.query('SELECT COUNT(*) FROM reservations WHERE event_id = $1', [eventId]);
  return { reservations, total };
}

export async function updateReservationScannedStatus(reservationID: string) {
  return await pool.query(`
    UPDATE reservations SET scanned = true WHERE reservation_uuid = $1
  `, [reservationID])
}

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