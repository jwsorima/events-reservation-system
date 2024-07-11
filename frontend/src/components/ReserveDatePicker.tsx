import { useEffect, useState } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isDate, startOfDay, isBefore, isAfter, isSameDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

interface ReservePickerProps {
  startDate: Date | string;
  endDate: Date | string;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  dateAcceptRef: React.MutableRefObject<Date | null>;
  validateField: (field: string, value: Date | null) => string;
  submitted: boolean;
  disabled: boolean;
}

const ReserveDatePicker: React.FC<ReservePickerProps> = ({ startDate, endDate, selectedDate, setSelectedDate, dateAcceptRef, validateField, submitted, disabled }) => {
  const [dateError, setDateError] = useState<string>('');
  const timeZone = 'Asia/Manila';

  const startOfDayInUTC8 = (date: Date) => {
    const dateToUTC = fromZonedTime(date, "Asia/Manila")
    return startOfDay(formatInTimeZone(dateToUTC, 'Asia/Manila', 'MMM d, yyyy, h:mm a'));
  };

  const today = startOfDay(formatInTimeZone(new Date(), 'Asia/Manila', 'MMM d, yyyy, h:mm a'));

  const shouldDisableDate = (date: Date): boolean => {
    if (!isDate(date)) return true;
    const startOfDayDate = startOfDayInUTC8(date);

    const dateToCheck = startOfDay(toZonedTime(date, timeZone));
    const startDay = toZonedTime(startOfDay(startDate), timeZone);
    const endDay = toZonedTime(startOfDay(endDate), timeZone);

    if( 
      (isSameDay(startOfDayDate, today) && isAfter(dateToCheck, startDay) && isBefore(dateToCheck, endDay)) || 
      isSameDay(dateToCheck, startDay) || 
      isSameDay(dateToCheck, endDay)
    ) {
      return false;
    }

    if(isBefore(startOfDayDate, today)) return true;

    if(isAfter(dateToCheck, startDay) && isBefore(dateToCheck, endDay)) return false;

    return true;
  };

  const handleDateAccept = (date: Date | null) => {
    if(date) {
      setSelectedDate(date);
      const utc8Date = fromZonedTime(date, 'Asia/Manila');
      dateAcceptRef.current = utc8Date;
    }
  }

  useEffect(() => {
    if (submitted) {
      const error = validateField('selectedDate', selectedDate);
      setDateError(error);
    }
  }, [submitted, selectedDate, validateField]);

  return (
    <DatePicker
      label="Select Date"
      timezone="Asia/Manila"
      value={selectedDate}
      onAccept={handleDateAccept}
      shouldDisableDate={shouldDisableDate}
      slotProps={{
        textField: {
          variant: 'outlined',
          error: !!dateError,
          helperText: dateError,
          onKeyDown: (e) => e.preventDefault()
        }
      }}
      disabled={disabled}
    />
  );
};

export default ReserveDatePicker;