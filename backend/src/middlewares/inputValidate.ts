import { Request, Response, NextFunction } from 'express';
import { dateToUtc8, escapeHtml, formatDateToYMD } from '../helpers/stringHelper.js';

export function validateCreateEvent(req: Request, res: Response, next: NextFunction) {
  const { event_name, slots, location, start_datetime, end_datetime } = req.body;
  const startDateTime = new Date(start_datetime).getTime();
  const endDateTime = new Date(end_datetime).getTime();

  const errors: { field: string; message: string }[] = [];

  if (!event_name || typeof event_name !== 'string' || event_name.trim() === '') {
    errors.push({ field: 'event_name', message: 'Event name is required' });
  }

  if (!slots) {
    errors.push({ field: 'slots', message: 'Slots is required' });
  } else if (isNaN(Number(slots))) {
    errors.push({ field: 'slots', message: 'Invalid slots' });
  }

  if (!location || typeof location !== 'string' || location.trim() === ''){
    errors.push({ field: 'location', message: 'Location is required' });
  }
  
  if (isNaN(startDateTime)) {
    errors.push({ field: 'start datetime', message: 'Valid datetime is required' });
  }
  
  if (isNaN(endDateTime)) {
    errors.push({ field: 'end datetime', message: 'Valid datetime is required' });
  }

  if (startDateTime >= endDateTime) {
    errors.push({ field: 'start and end datetime', message: 'Invalid datetime range' });
  }

  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).json({ errors });
  }

  next();
}

export function validateCreateReservation(req: Request, res: Response, next: NextFunction) {
  const { event_id, name, email, mobile_number } = req.body;
  req.body.reservation_date = dateToUtc8(req.body.reservation_date);
  req.body.address = escapeHtml(req.body.address);

  const errors: { field: string; message: string }[] = [];

  if (!Number.isInteger(event_id)) {
    errors.push({ field: 'event_id', message: 'Event ID must be an integer' });
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (!/^[A-Za-zÀ-ÿ ',-.]+$/.test(name)) {
    errors.push({ field: 'name', message: 'Invalid character(s) provided in name' });
  }
  
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!mobile_number || typeof mobile_number !== 'string' || mobile_number.trim() === '') {
    errors.push({ field: 'mobile_number', message: 'Mobile number is required' });
  } else if (/[A-Za-zÀ-ÿ]/.test(mobile_number)) {
    errors.push({ field: 'mobile_number', message: 'Invalid character(s) provided' });
  } else if (/^(?!9\d{2} \d{3} \d{4}$)/.test(mobile_number)) {
    errors.push({ field: 'mobile_number', message: 'Valid mobile number is required' });
  }

  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  const splitDateTimezone = formatDateToYMD(req.body.reservation_date);

  if (!splitDateTimezone || !dateFormatRegex.test(splitDateTimezone)) {
    errors.push({ field: 'reservation_date', message: 'Valid date is required in format YYYY-MM-DD' });
  } else {
    const [year, month, day] = splitDateTimezone.split('-').map(Number);

    const date = new Date(`${year}-${month}-${day}`);
    const isValidDate =
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day;

    if (!isValidDate) {
      errors.push({ field: 'reservation_date', message: 'Valid date is required' });
    }
  }

  //validate address length
  if (!req.body.address || typeof req.body.address !== 'string' || req.body.address.trim() === '') {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if(req.body.address.length > 255) {
    errors.push({ field: 'address', message: 'Address should be less than or equal to 255 characters' });
  }

  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).json({ errors });
  }

  next();
}

export function validateDeleteEvent(req: Request, res: Response, next: NextFunction) {
  if(isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Invalid input syntax: expected a number' });
  }
  next();
}

export function validateDeleteReservation(req: Request, res: Response, next: NextFunction) {
  if(isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Invalid input syntax: expected a number' });
  }
  next();
}

export function validateDownloadEvent(req: Request, res: Response, next: NextFunction) {
  if(isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Invalid input syntax: expected a number' });
  }
  next();
}

export function validateGetAdminEvents(req: Request, res: Response, next: NextFunction) {
  const errors: { field: string; message: string }[] = [];
  
  if(isNaN(Number(req.query.page))) {
    errors.push({ field: 'page', message: 'Invalid input syntax: expected a number' });
  }

  if(isNaN(Number(req.query.limit))) {
    errors.push({ field: 'limit', message: 'Invalid input syntax: expected a number' });
  }

  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).json({ errors });
  }

  next();
}

export function validateGetEventsReservation(req: Request, res: Response, next: NextFunction) {
  const errors: { field: string; message: string }[] = [];

  if(isNaN(Number(req.params.id))) {
    errors.push({ field: 'id', message: 'Invalid input syntax: expected a number' });
  }
  
  if(isNaN(Number(req.query.page))) {
    errors.push({ field: 'page', message: 'Invalid input syntax: expected a number' });
  }

  if(isNaN(Number(req.query.limit))) {
    errors.push({ field: 'limit', message: 'Invalid input syntax: expected a number' });
  }

  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).json({ errors });
  }

  next();
}

export function validateUpdateEvent(req: Request, res: Response, next: NextFunction) {
  if(isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Invalid input syntax: expected a number' });
  }

  const { event_name, slots, location, start_datetime, end_datetime } = req.body;
  const startDateTime = new Date(start_datetime).getTime();
  const endDateTime = new Date(end_datetime).getTime();

  const errors: { field: string; message: string }[] = [];

  if (!event_name || typeof event_name !== 'string' || event_name.trim() === '') {
    errors.push({ field: 'event_name', message: 'Event name is required' });
  }

  if (!slots) {
    errors.push({ field: 'slots', message: 'Slots is required' });
  } else if (isNaN(Number(slots))) {
    errors.push({ field: 'slots', message: 'Invalid slots' });
  }

  if (!location || typeof location !== 'string' || location.trim() === ''){
    errors.push({ field: 'location', message: 'Location is required' });
  }
  
  if (isNaN(startDateTime)) {
    errors.push({ field: 'start datetime', message: 'Valid datetime is required' });
  }
  
  if (isNaN(endDateTime)) {
    errors.push({ field: 'end datetime', message: 'Valid datetime is required' });
  }

  if (startDateTime >= endDateTime) {
    errors.push({ field: 'start and end datetime', message: 'Invalid datetime range' });
  }

  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).json({ errors });
  }

  next();
}