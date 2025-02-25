import { Router, Request, Response } from 'express';
const reservations = Router();
import {
  dbQuery,
} from "../db/index.js";
import { 
  getReservation, 
  updateReservationScannedStatus 
} from '../db/reservationsQueries.js';
import { getEvent } from '../db/eventsQueries.js';
import { createReservationURL, isUuidV4 } from "../helpers/stringHelper.js"
import { sendEmailReservationConfirm } from '../helpers/emailHelper.js';
import { checkAuth } from '../middlewares/auth.js';
import { 
  validateCreateReservation, 
  validateDeleteReservation, 
} from '../middlewares/inputValidate.js';
import { conditionalRateLimiter, rateLimitAdmin, rateLimitUsers } from '../middlewares/rateLimiters.js';
import { v4 as uuidv4 } from 'uuid';

reservations.post('/', rateLimitUsers, validateCreateReservation, async (req: Request, res: Response) => {
  const { event_id, name, email, mobile_number, reservation_date, address } = req.body;

  try {
    const existingReservation = await dbQuery(
      'SELECT * FROM reservations WHERE event_id = $1 AND LOWER(email) = LOWER($2)',
      [event_id, email]
    );

    if (existingReservation.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A reservation with this email already exists for the selected event.' });
    }

    const reservationUUID = uuidv4();

    const insertResult = await dbQuery(
      `WITH slots_check AS (
        SELECT 
          e.event_id,
          e.slots - COALESCE(COUNT(r.reservation_id), 0) AS slots_left
        FROM Events e
        LEFT JOIN Reservations r ON e.event_id = r.event_id
        WHERE e.event_id = $1
        GROUP BY e.slots, e.event_id
      )
      INSERT INTO Reservations (event_id, name, email, mobile_number, reservation_date, address, reservation_uuid)
      SELECT $1, $2, $3, $4, $5, $6, $7
      FROM slots_check
      WHERE slots_left > 0
      RETURNING reservation_id, event_id, reservation_date, reservation_uuid`,
      [event_id, name, email, mobile_number, reservation_date, address, reservationUUID]
    );

    if (insertResult.rowCount === 0) {
      return res.status(409).json({ message: 'Slots full' });
    }

    const insertedReservation = insertResult.rows[0];

    const reservationNumberResult = await dbQuery(
      `WITH NumberedReservations AS (
         SELECT reservation_uuid, 
                ROW_NUMBER() OVER (ORDER BY reservation_date ASC, reservation_id ASC) as reservation_number 
         FROM reservations 
         WHERE event_id = $1
       )
       SELECT reservation_uuid, reservation_number
       FROM NumberedReservations
       WHERE reservation_uuid = $2`,
      [event_id, insertedReservation.reservation_uuid]
    );
    
    const reservationNumber = reservationNumberResult.rows[0];
    
    const reservation = {
      event_id: insertedReservation.event_id,
      reservation_uuid: insertedReservation.reservation_uuid,
      reservation_number: reservationNumber.reservation_number
    };

    const url = createReservationURL(reservation.event_id, reservation.reservation_uuid);

    sendEmailReservationConfirm({
      email: email,
      name: name,
      url: url,
      reservationDateFormatted: reservation_date,
      reservationNumber: reservation.reservation_number,
    }).then(_response => {
      res.status(201).json({ success: true });
    })
    
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      res.status(500).send(error.message);
    } else {
      console.log('An unexpected error occurred:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});

reservations.delete('/:id', rateLimitAdmin, checkAuth, validateDeleteReservation, async (req: Request, res: Response) => {
  const reservation_id = req.params.id;

  try {
    const result = await dbQuery('DELETE FROM Reservations WHERE reservation_id = $1 RETURNING *', [reservation_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.status(200).json({ message: 'Reservation deleted successfully', reservation: result.rows[0] });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } else {
      console.log('An unexpected error occurred:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});

reservations.get('/details', conditionalRateLimiter, async (req: Request, res: Response) => {
  const { event_id, reservation_id } = req.query;  // Note that reservation_id is actually reservation_uuid

  if(isNaN(Number(req.query.event_id))) {
    return res.status(400).json({ error: 'Invalid input syntax: expected a number' });
  }

  if(typeof reservation_id !== 'string' || !isUuidV4(reservation_id)) {
    return res.status(400).json({ message: 'Invalid qr code' })
  }

  //try combining event and reservation query
  try {
    if (req.session.userId) {
      let reservationResult = await getReservation(parseInt(event_id as string, 10), reservation_id)

      if (reservationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const eventResult = await getEvent(parseInt(event_id as string, 10))

      if (reservationResult.rows[0].scanned) {
        return res.status(200).json({
          message: 'Reservation has already been scanned',
          event: eventResult.rows[0],
          reservation: reservationResult.rows[0],
        });
      }

      await updateReservationScannedStatus(reservation_id)

      return res.status(200).json({
        message: 'Reservation has been scanned',
        event: eventResult.rows[0],
        reservation: reservationResult.rows[0],
      });

    } else {

      const eventResult = await getEvent(parseInt(event_id as string, 10))
      const reservationResult = await getReservation(parseInt(event_id as string, 10), reservation_id)

      if (eventResult.rows.length === 0 || reservationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Event or Reservation not found' });
      }

      delete reservationResult.rows[0].scanned
      res.status(200).json({
        event: eventResult.rows[0],
        reservation: reservationResult.rows[0],
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default reservations;