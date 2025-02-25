import { QueryResult } from 'pg';
import { dbQuery } from './index.js'

export async function getReservationsWithPage(eventID: number, limit: number, offset: number) {
  const reservations = await dbQuery(`
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
  `, [eventID, limit, offset]);
  const total = await dbQuery('SELECT COUNT(*) FROM reservations WHERE event_id = $1', [eventID]);
  return { reservations, total };
}

export async function getReservation(eventID: number, reservationID: string) {

  return await dbQuery(`
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
  `, [eventID, reservationID]);
}

export async function updateReservationScannedStatus(reservationID: string) {
  return await dbQuery(`
    UPDATE reservations SET scanned = true WHERE reservation_uuid = $1
  `, [reservationID]);
}

// not used functions from main 

export async function deleteReservationsOfEvent(eventID: number) {
  return await dbQuery('DELETE FROM reservations WHERE event_id = $1', [eventID])
}


export async function findEmailInEvent(eventID: number, email: string){
  const lowerCaseEmail = email.toLowerCase();

  return await dbQuery(`
    SELECT r.reservation_id
    FROM reservations r
    JOIN emails e ON r.email_id = e.email_id
    WHERE r.event_id = $1 AND e.email_address = $2
  `, [eventID, lowerCaseEmail]
  );
}

export async function createReservation(
  eventID: number, 
  name: string, 
  email: string, 
  mobileNumber: string, 
  reservationDate: Date, 
  address: string, 
  reservationUUID: string): Promise<QueryResult<any>> {
  try {
    await dbQuery('BEGIN');

    const slotsResult = await dbQuery(`
      SELECT 
        e.event_id,
        e.slots - COALESCE(COUNT(r.reservation_id), 0) AS slots_left
      FROM Events e
      LEFT JOIN Reservations r ON e.event_id = r.event_id
      WHERE e.event_id = $1
      GROUP BY e.slots, e.event_id
    `, [eventID]);

    const slotsLeft = slotsResult.rows[0].slots_left;

    if (slotsLeft > 0) {
      let emailResult = await dbQuery(`
        SELECT email_id FROM emails WHERE email_address = LOWER($1)
      `, [email]);

      let emailId;

      if (emailResult.rows.length === 0) {
        const insertEmailResult = await dbQuery(`
          INSERT INTO emails (email_address) 
          VALUES (LOWER($1))
          RETURNING email_id
        `, [email]);

        emailId = insertEmailResult.rows[0].email_id;
      } else {
        emailId = emailResult.rows[0].email_id;
      }

      const insertReservationResult = await dbQuery(`
        INSERT INTO Reservations (event_id, name, email_id, mobile_number, reservation_date, address, reservation_uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING event_id, reservation_uuid
      `, [eventID, name, emailId, mobileNumber, reservationDate, address, reservationUUID]);

      await dbQuery('COMMIT');

      return insertReservationResult;
    } else {

      await dbQuery('ROLLBACK');
      return {
        rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as QueryResult<any>;
    }

  } catch (error) {
    await dbQuery('ROLLBACK');
    throw error;
  }
}

export async function getReservationNumber(eventID: number, reservationUUID: string) {
  return await dbQuery(
    `WITH NumberedReservations AS (
       SELECT reservation_uuid, 
              ROW_NUMBER() OVER (ORDER BY reservation_date ASC, reservation_id ASC) as reservation_number 
       FROM reservations 
       WHERE event_id = $1
     )
     SELECT reservation_uuid, reservation_number
     FROM NumberedReservations
     WHERE reservation_uuid = $2`,
    [eventID, reservationUUID]
  );
}

export async function deleteReservation(reservationID: number) {
  return await dbQuery('DELETE FROM Reservations WHERE reservation_id = $1 RETURNING *', [reservationID]);
}

export async function getReservationAdmin(eventID: number, reservationID: string) {
  return await dbQuery(`
    WITH numbered_reservations AS (
      SELECT 
        r.reservation_uuid,
        r.name,
        e.email_address AS email,
        r.mobile_number,
        r.reservation_date,
        r.address,
        r.scanned,
        ROW_NUMBER() OVER (ORDER BY r.reservation_date ASC, r.reservation_id ASC) as reservation_number
      FROM reservations r
      JOIN emails e ON r.email_id = e.email_id
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
  `, [eventID, reservationID]);
}