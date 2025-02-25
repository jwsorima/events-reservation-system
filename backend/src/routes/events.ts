import { Router, Request, Response } from 'express';
const events = Router();
import { dbQuery } from "../db/index.js"
import { getReservationsWithPage } from '../db/reservationsQueries.js';
import { 
  createEvent,
  getAllEvents, 
  getAllEventsWithPage, 
  getAvailableEvents
} from '../db/eventsQueries.js';
import { checkAuth } from '../middlewares/auth.js';
import { 
  validateCreateEvent, 
  validateGetAdminEvents, 
  validateDeleteEvent, 
  validateDownloadEvent, 
  validateUpdateEvent, 
  validateGetEventsReservation
} from '../middlewares/inputValidate.js';
import { rateLimitAdmin, rateLimitUsers } from '../middlewares/rateLimiters.js';
import { toZonedTime, format } from 'date-fns-tz';
import ExcelJS from 'exceljs/dist/es5/index.js';


events.get('/', rateLimitUsers, async (_req: Request, res: Response) => {
  try {
    const result = await getAvailableEvents();
    const events = result.rows;

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

events.get('/admin', rateLimitAdmin, checkAuth, validateGetAdminEvents, async (req: Request, res: Response) => {
  const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 0;
  const limit = typeof req.query.limit === 'string'  ? parseInt(req.query.limit, 10) : 5;
  const offset = page * limit;

  try {
    const { events, total } = await getAllEventsWithPage(limit, offset);
    res.json({ events: events.rows, total: parseInt(total.rows[0].count, 10) });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } else {
      console.log('An unexpected error occurred:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

events.get('/all', rateLimitAdmin, checkAuth, async (_req: Request, res: Response) => {
  try {
    const result = await getAllEvents();
    const events = result.rows

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

events.get('/:id/reservations', rateLimitAdmin, checkAuth, validateGetEventsReservation, async (req: Request, res: Response) => {
  const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 0;
  const limit = typeof req.query.limit === 'string'  ? parseInt(req.query.limit, 10) : 0;
  const offset = page * limit;
  const eventId = parseInt(req.params.id);

  try {
    const { reservations, total } = await getReservationsWithPage(eventId, limit, offset)
    res.json({ reservations: reservations.rows, total: parseInt(total.rows[0].count, 10) });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } else {
      console.log('An unexpected error occurred:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

events.post('/', rateLimitAdmin, checkAuth, validateCreateEvent, async (req: Request, res: Response) => {
  const { event_name, slots, location, start_datetime, end_datetime } = req.body;
  try {
    await createEvent(event_name, slots, location, start_datetime, end_datetime);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

events.put('/:id', rateLimitAdmin, checkAuth, validateUpdateEvent, async (req: Request, res: Response) => {
  const event_id = req.params.id;
  const { event_name, slots, location, start_datetime, end_datetime } = req.body;

  try {
    const result = await dbQuery(
      `UPDATE Events 
       SET event_name = $1, slots = $2, location = $3, start_datetime = $4, end_datetime = $5 
       WHERE event_id = $6`,
      [event_name, slots, location, start_datetime, end_datetime, event_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

events.get('/:id/download', rateLimitAdmin, checkAuth, validateDownloadEvent, async (req: Request, res: Response) => {
  try {
    const event_id = req.params.id;

    const eventResult = await dbQuery('SELECT * FROM Events WHERE event_id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).send('Event not found');
    }
    const event = eventResult.rows[0];

    const reservationsResult = await dbQuery(
      `WITH NumberedReservations AS (
         SELECT reservation_id, name, email, mobile_number, reservation_date, address, scanned, 
                ROW_NUMBER() OVER (ORDER BY reservation_date ASC, reservation_id ASC) as reservation_number 
         FROM Reservations 
         WHERE event_id = $1
       )
       SELECT reservation_id, name, email, mobile_number, reservation_date, address, scanned, reservation_number
       FROM NumberedReservations`,
      [event_id]
    );
    const attendeesCount = reservationsResult.rows.filter(reservation => reservation.scanned).length;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reservations');

    worksheet.addRow(['Event Name', 'Slots', 'Location', 'Start Date', 'End Date', 'Total Attendees']);
    worksheet.addRow([
      event.event_name,
      event.slots,
      event.location,
      format(toZonedTime(event.start_datetime, 'Asia/Manila'), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Manila' }),
      format(toZonedTime(event.end_datetime, 'Asia/Manila'), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Manila' }),
      attendeesCount
    ]);
    worksheet.addRow([]);

    const eventColumnWidths = [
      { width: 30 },
      { width: 10 },
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 20 }
    ];
    eventColumnWidths.forEach((col, i) => {
      worksheet.getColumn(i + 1).width = col.width;
    });

    worksheet.addRow([
      'Reservation Number', 'Name', 'Email', 'Mobile Number', 
      'Reservation Date', 'Address', 'Attended'
    ]);

    reservationsResult.rows.forEach(reservation => {
      const zonedDate = toZonedTime(reservation.reservation_date, 'Asia/Manila');
      const formattedDate = format(zonedDate, 'yyyy-MM-dd', { timeZone: 'Asia/Manila' });
      worksheet.addRow([
        reservation.reservation_number,
        reservation.name,
        reservation.email,
        reservation.mobile_number,
        formattedDate,
        reservation.address,
        reservation.scanned ? 'Yes' : 'No'
      ]);
    });

    const columnWidths = [
      { key: 'reservation_number', width: 20 },
      { key: 'name', width: 30 },
      { key: 'email', width: 30 },
      { key: 'mobile_number', width: 15 },
      { key: 'reservation_date', width: 20 },
      { key: 'address', width: 50 },
      { key: 'attended', width: 10 }
    ];
    columnWidths.forEach((col, i) => {
      worksheet.getColumn(i + 1).width = col.width;
    });

    const xlsxBuffer = await workbook.xlsx.writeBuffer();

    res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': xlsxBuffer.byteLength,
        'Content-Disposition': `attachment; filename=event_${event_id}_reservations.xlsx`,
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length'
    })
    res.write(xlsxBuffer);
    res.end();

  } catch (err) {
    console.error('Error downloading reservations:', err);
    res.status(500).send('Internal server error');
  }
});

events.delete('/:id', rateLimitAdmin, checkAuth, validateDeleteEvent, async (req: Request, res: Response) => {
  const event_id = req.params.id;

  try {
    await dbQuery('DELETE FROM reservations WHERE event_id = $1', [event_id]);

    const eventDelete = await dbQuery('DELETE FROM events WHERE event_id = $1', [event_id]);

    if (eventDelete.rowCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event and its reservations deleted successfully' });
  } catch (error) {
    console.error('Error deleting event and reservations:', error);
    res.status(500).json({ message: 'An error occurred while deleting the event and its reservations' });
  }
});

export default events;