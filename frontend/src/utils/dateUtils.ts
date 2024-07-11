import { startOfDay, isBefore, isAfter } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const startOfDayInUTC8 = (date: Date) => {
  const dateToUTC = fromZonedTime(date, "Asia/Manila")
  return startOfDay(formatInTimeZone(dateToUTC, 'Asia/Manila', 'MMM d, yyyy, h:mm a'));
};

const today = startOfDay(formatInTimeZone(new Date(), 'Asia/Manila', 'MMM d, yyyy, h:mm a'));

export const shouldDisableStartDate = (date: Date, startDate: Date | null, endDate: Date | null) => {
  if (!date) return true;
  const startOfDayDate = startOfDayInUTC8(date);

  if (isBefore(startOfDayDate, today)) return true;

  if (!startDate && endDate && isAfter(startOfDayDate, startOfDay(endDate))) return true;

  if (startDate) {
    if (endDate && isAfter(startOfDayDate, startOfDay(endDate))) return true;
  }

  return false;
};

export const shouldDisableEndDate = (date: Date, startDate: Date | null, endDate: Date | null) => {
  if (!date) return true;
  const startOfDayDate = startOfDayInUTC8(date);

  if (isBefore(startOfDayDate, today)) return true;

  if (!endDate && startDate && isBefore(startOfDayDate, startOfDay(startDate))) return true;

  if (endDate) {
    if (startDate && isBefore(startOfDayDate, startOfDay(startDate))) return true;
  }

  return false;
};


export const shouldDisableStartDateUpdateEvent = (date: Date, startDate: Date | null, endDate: Date | null) => {
  if (!date) return true;
  const startOfDayDate = startOfDayInUTC8(date);

  if (!startDate && endDate && isAfter(startOfDayDate, startOfDay(endDate))) return true;

  if (startDate) {
    if (endDate && isAfter(startOfDayDate, startOfDay(endDate))) return true;
  }

  return false;
};

export const shouldDisableEndDateUpdateEvent = (date: Date, startDate: Date | null, endDate: Date | null) => {
  if (!date) return true;
  const startOfDayDate = startOfDayInUTC8(date);

  if (!endDate && startDate && isBefore(startOfDayDate, startOfDay(startDate))) return true;

  if (endDate) {
    if (startDate && isBefore(startOfDayDate, startOfDay(startDate))) return true;
  }

  return false;
};