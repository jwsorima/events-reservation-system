import React, { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import Grid from "@mui/material/Grid";
import { useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import CreateEventForm from "../../components/Forms/CreateEventForm";
import Calendar from "../../components/Calendar";
import { validateFieldCreateEvent } from "../../utils/inputValidate";

export interface EventCreate {
  event_name: string;
  start_datetime: Date;
  end_datetime: Date;
  location: string;
  slots_left: number;
  color: string;
}

export default function CreateEvent(){
  const [name, setName] = useState('');
  const [slots, setSlots] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const startDateRef = useRef<Date | null>(null);
  const endDateRef = useRef<Date | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [events, setEvents] = useState<EventCreate[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStartDateAccept = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      const utc8Date = fromZonedTime(date, 'Asia/Manila');
      startDateRef.current = utc8Date;

      setErrors({
        ...errors,
        startDate: validateFieldCreateEvent('startDate', utc8Date)
      });
    }
  };

  const handleEndDateAccept = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      const utc8Date = fromZonedTime(date, 'Asia/Manila');
      endDateRef.current = utc8Date;

      setErrors({
        ...errors,
        endDate: validateFieldCreateEvent('endDate', utc8Date)
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'slots':
        if (value === '') {
          setSlots(null);
        } else {
          setSlots(Number(value));
        }
        break;
      case 'location':
        setLocation(value);
        break;
    }
    setErrors({
      ...errors,
      [name]: validateFieldCreateEvent(name, value)
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let newErrors: { [key: string]: string } = {
      name: validateFieldCreateEvent('name', name),
      slots: validateFieldCreateEvent('slots', slots),
      location: validateFieldCreateEvent('location', location),
      startDate: validateFieldCreateEvent('startDate', startDateRef.current),
      endDate: validateFieldCreateEvent('endDate', endDateRef.current)
    };

    if (newErrors.startDate === "" && newErrors.endDate === "") {
      if (startDateRef.current!.getTime() >= endDateRef.current!.getTime()) {
        newErrors.startDate = "Start date must be before the end date";
        newErrors.endDate = "Start date must be before the end date";
      }
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events`, {
        event_name: name,
        slots: slots,
        location: location,
        start_datetime: startDateRef.current,
        end_datetime: endDateRef.current
      }, { withCredentials: true });
      setSnackbarMessage('Event creation is successful!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setName('');
      setSlots(null);
      setLocation('');
      setStartDate(null);
      setEndDate(null);
      startDateRef.current = null;
      endDateRef.current = null;
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setSnackbarMessage(`Error creating event: ${error.message}`);
      } else {
        setSnackbarMessage('An unknown error occurred');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const colorList = [
      '#0073b1', // Blue
      '#00b6e3', // Cyan
      '#ffcc00', // Yellow
      '#ff6f61', // Orange
      '#ff4d8b', // Pink
      '#28a745', // Green
      '#6f42c1', // Purple
      '#6c757d'  // Gray
    ];
    const convertToUtcPlus8 = (events: EventCreate[]) => {
      return events.map((event, index) => ({
        ...event,
        start_datetime: toZonedTime(new Date(event.start_datetime), 'Asia/Manila'),
        end_datetime: toZonedTime(new Date(event.end_datetime), 'Asia/Manila'),
        color: colorList[index % colorList.length]
      }));
    };
    axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/all`, { withCredentials: true })
    .then(response => {
      const convertedEvents = convertToUtcPlus8(response.data);
      setEvents(convertedEvents);
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
  }, [snackbarOpen]);

  const theme = useTheme()

  return <>
    <CssBaseline />
    <Box sx={{
      margin: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      bgcolor: "#fafafa",
      padding: 2,
      width: "100%",
      borderRadius: 2,
      boxShadow: 8,
    }}>
      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={3} my="auto">
          <Typography variant="h5" component="div" color={theme.palette.primary.main} sx={{ textAlign: 'center' }}>
            Create Event
          </Typography>

          <CreateEventForm 
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            name={name}
            slots={slots}
            location={location}
            startDate={startDate}
            endDate={endDate}
            startDateRef={startDateRef}
            endDateRef={endDateRef}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleStartDateAccept={handleStartDateAccept}
            handleEndDateAccept={handleEndDateAccept}
            loading={loading}
            snackbarOpen={snackbarOpen}
            snackbarMessage={snackbarMessage}
            snackbarSeverity={snackbarSeverity}
            handleCloseSnackbar={handleCloseSnackbar}
            errors={errors}
          />

        </Grid>
        <Grid item xs={12} md={9}>
        
          <Calendar events={events}/>

        </Grid>
      </Grid>
    </Box>
  </>
}