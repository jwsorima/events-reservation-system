import { dbQuery } from './index.js'
import { getCurrentDateInGMT8 } from "../helpers/stringHelper.js";

export async function getAvailableEvents() {
  const currentDate = getCurrentDateInGMT8().toISOString();

  return await dbQuery(`
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
  return await dbQuery(`
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

export async function createEvent(eventName: string, slots: number, location: string, startDateTime: string, endDateTime: string) {
  return await dbQuery(`
    INSERT INTO Events (event_name, slots, location, start_datetime, end_datetime) VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [eventName, slots, location, startDateTime, endDateTime]);
}

export async function getAllEventsWithPage(limit: number, offset: number) {
  const events = await dbQuery(`
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
  const total = await dbQuery(`SELECT COUNT(*) FROM events`)
  return { events, total };
}

export async function getEvent(eventID: number) {
  return await dbQuery(`
    SELECT 
      event_name,
      location,
      start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      end_datetime AT TIME ZONE 'UTC' AS end_datetime 
    FROM Events WHERE event_id = $1
  `, [eventID]);
}

// not used functions from main 

export async function updateEvent(eventName: string, slots: number, location: string, startDateTime: string, endDateTime: string, eventID: number) {
  return await dbQuery(
    `UPDATE events 
     SET event_name = $1, slots = $2, location = $3, start_datetime = $4, end_datetime = $5 
     WHERE event_id = $6`,
    [eventName, slots, location, startDateTime, endDateTime, eventID]
  );
}

export async function getEventInUTC(eventID: number) {
  return await dbQuery(`
    SELECT 
      event_name,
      location,
      start_datetime AT TIME ZONE 'UTC' AS start_datetime, 
      end_datetime AT TIME ZONE 'UTC' AS end_datetime 
    FROM events WHERE event_id = $1
  `, [eventID])
}

export async function getEventReservations(eventID: number) {
  return await dbQuery(`
      WITH NumberedReservations AS (
        SELECT 
          r.reservation_id, r.name, e.email_address AS email, r.mobile_number, 
          r.reservation_date, r.address, r.scanned, 
          ROW_NUMBER() OVER (ORDER BY r.reservation_date ASC, r.reservation_id ASC) as reservation_number
        FROM Reservations r
        JOIN emails e ON r.email_id = e.email_id
        WHERE r.event_id = $1
      )
      SELECT reservation_id, name, email, mobile_number, reservation_date, address, scanned, reservation_number
      FROM NumberedReservations`,
    [eventID]
  );
}

export async function deleteEvent(eventID: number) {
  return await dbQuery('DELETE FROM events WHERE event_id = $1', [eventID])
}