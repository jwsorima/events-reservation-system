import React, { useState, useEffect, useRef } from 'react';
import {
  TableContainer,
  Paper,
  Typography,
  Box,
  CssBaseline
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { validateFieldUpdateEvent } from '../../utils/inputValidate';
import UpdateEventDialog from '../../components/Dialogs/UpdateEventDialog';
import DeleteReservationDialog from '../../components/Dialogs/DeleteReservationDialog';
import DeleteEventDialog from '../../components/Dialogs/DeleteEventDialog';
import ViewReservationsDialog from '../../components/Dialogs/ViewReservationsDialog';
import EventTable from '../../components/EventTable';

export interface Event {
  event_id: number;
  event_name: string;
  slots: number;
  location: string;
  start_datetime: string | Date;
  end_datetime: string | Date;
}

export interface Reservation {
  reservation_id: number;
  event_id: number;
  name: string;
  email: string;
  mobile_number: string;
  reservation_date: string;
  reservation_number: number;
  address: string;
  scanned: boolean;
}

const EventReservations: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteEventDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReservationDialogOpen, setDeleteReservationDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  
  const [eventPage, setEventPage] = useState(0);
  const [eventRowsPerPage, setEventRowsPerPage] = useState(5);
  const [reservationPage, setReservationPage] = useState(0);
  const [reservationRowsPerPage, setReservationRowsPerPage] = useState(5);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [currentReservations, setCurrentReservations] = useState<Reservation[]>([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [reservationTotal, setReservationTotal] = useState(0);
  const [editEventData, setEditEventData] = useState<Event | null>(null);

  const [name, setName] = useState('');
  const [slots, setSlots] = useState<number | null>(null);
  const currentSlots = useRef<number | null>(null);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const startDateRef = useRef<Date | null>(null);
  const endDateRef = useRef<Date | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [downloadErrorSnackbarOpen, setDownloadErrorSnackbarOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleStartDateAccept = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      const utc8Date = fromZonedTime(date, 'Asia/Manila');
      startDateRef.current = utc8Date;

      setErrors({
        ...errors,
        startDate: validateFieldUpdateEvent('startDate', utc8Date)
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
        endDate: validateFieldUpdateEvent('endDate', utc8Date)
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
      [name]: validateFieldUpdateEvent(name, value)
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleDownloadErrorSnackbarClose = () => {
    setDownloadErrorSnackbarOpen(false);
  };

  const handleClickOpenReservations = (event: Event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleCloseReservations = () => {
    setOpen(false);
    setCurrentReservations([]);
    setReservationTotal(0);
    setSelectedEvent(null);
    setReservationPage(0);
  };

  const handleEditEventDialogOpen = (event: Event) => {
    setEditEventData(event);
    setName(event.event_name);
    setSlots(event.slots);
    currentSlots.current = event.slots;
    setLocation(event.location);
    setStartDate(new Date(toZonedTime(event.start_datetime, 'Asia/Manila')));
    setEndDate(new Date(toZonedTime(event.end_datetime, 'Asia/Manila')));
    startDateRef.current = new Date(toZonedTime(event.start_datetime, 'Asia/Manila'));
    endDateRef.current = new Date(toZonedTime(event.end_datetime, 'Asia/Manila'));
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditEventData(null);
    setName('');
    setSlots(null);
    currentSlots.current = null;
    setLocation('');
    setStartDate(null);
    setEndDate(null);
    startDateRef.current = null;
    endDateRef.current = null;
  };

  const handleDeleteEventDialogOpen = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEventDialogClose = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteReservationDialogOpen = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setDeleteReservationDialogOpen(true);
  };

  const handleDeleteReservationDialogClose = () => {
    setDeleteReservationDialogOpen(false);
    setReservationToDelete(null);
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await axios.delete(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/${eventToDelete.event_id}`, {
          withCredentials: true,
        });
        setCurrentEvents((prevEvents) => prevEvents.filter((event) => event.event_id !== eventToDelete.event_id));
        handleDeleteEventDialogClose();
      } catch (error) {
        console.error('Failed to delete the event:', error);
      }
    }
  };

  const handleDeleteReservation = async () => {
    if (reservationToDelete) {
      try {
        await axios.delete(`${import.meta.env.VITE_BE_DOMAIN_NAME}/reservations/${reservationToDelete.reservation_id}`, {
          withCredentials: true,
        });
        setCurrentReservations((prevReservations) =>
          prevReservations.filter((res) => res.reservation_id !== reservationToDelete.reservation_id)
        );
        handleDeleteReservationDialogClose();
      } catch (error) {
        console.error('Failed to delete the reservation:', error);
      }
    }
  };

  const handleEditEvent = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const newErrors: { [key: string]: string } = {
      name: validateFieldUpdateEvent('name', name),
      slots: validateFieldUpdateEvent('slots', slots),
      location: validateFieldUpdateEvent('location', location),
      startDate: validateFieldUpdateEvent('startDate', startDateRef.current),
      endDate: validateFieldUpdateEvent('endDate', endDateRef.current)
    };
  
    setErrors(newErrors);
  
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
  
    setLoading(true);
  
    try {
      if (editEventData) {
        const updatedEvent: Event = {
          ...editEventData,
          event_name: name,
          slots: slots !== null ? slots : 0,
          location: location,
          start_datetime: endDateRef.current ? startDateRef.current! : '',
          end_datetime: endDateRef.current ? endDateRef.current! : ''
        };
  
        await axios.put(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/${editEventData.event_id}`, updatedEvent, {
          withCredentials: true,
        });
  
        setCurrentEvents((prevEvents) =>
          prevEvents.map((event) => (event.event_id === editEventData.event_id ? updatedEvent : event))
        );
  
        setSnackbarMessage('Event update is successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleEditDialogClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        setSnackbarMessage(`Error updating event: ${error.message}`);
      } else {
        setSnackbarMessage('An unknown error occurred');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChangePage = (_: unknown, newPage: number) => {
    setEventPage(newPage);
  };

  const handleEventChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEventRowsPerPage(parseInt(event.target.value, 10));
    setEventPage(0);
  };

  const handleReservationChangePage = (_: unknown, newPage: number) => {
    setReservationPage(newPage);
  };

  const handleReservationChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReservationRowsPerPage(parseInt(event.target.value, 10));
    setReservationPage(0);
  };

  const handleDownload = async (event_id: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/${event_id}/download`, {
        withCredentials: true,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${event_id}_reservations.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download the file:', error);
      setSnackbarMessage('Failed to download the file');
      setSnackbarSeverity('error');
      setDownloadErrorSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/admin`, {
        params: { page: eventPage, limit: eventRowsPerPage },
        withCredentials: true 
      });
      setCurrentEvents(response.data.events);
      setEventTotal(response.data.total);
    };
    fetchEvents();
  }, [eventPage, eventRowsPerPage]);

  useEffect(() => {
    if (selectedEvent) {
      const fetchReservations = async () => {
        const response = await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events/${selectedEvent.event_id}/reservations`, {
          params: { page: reservationPage, limit: reservationRowsPerPage },
          withCredentials: true
        });
        setCurrentReservations(response.data.reservations);
        setReservationTotal(response.data.total);
      };
      fetchReservations();
    }
  }, [selectedEvent, reservationPage, reservationRowsPerPage]);

  return (
    <Box>
      <CssBaseline />
      <Typography variant="h4" component="h1" gutterBottom color={theme.palette.primary.main}>
        Event Reservations Overview
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 8 }}>
        
        <EventTable 
          currentEvents={currentEvents}
          handleClickOpenReservations={handleClickOpenReservations}
          handleEditEventDialogOpen={handleEditEventDialogOpen}
          handleDeleteEventDialogOpen={handleDeleteEventDialogOpen}
          handleDownload={handleDownload}
          eventTotal={eventTotal}
          eventRowsPerPage={eventRowsPerPage}
          eventPage={eventPage}
          handleEventChangePage={handleEventChangePage}
          handleEventChangeRowsPerPage={handleEventChangeRowsPerPage}
          setEventPage={setEventPage}
        />

        <ViewReservationsDialog 
          open={open}
          handleCloseReservations={handleCloseReservations}
          selectedEventName={selectedEvent?.event_name}
          currentReservations={currentReservations}
          handleDeleteReservationDialogOpen={handleDeleteReservationDialogOpen}
          reservationTotal={reservationTotal}
          reservationRowsPerPage={reservationRowsPerPage}
          reservationPage={reservationPage}
          handleReservationChangePage={handleReservationChangePage}
          handleReservationChangeRowsPerPage={handleReservationChangeRowsPerPage}
          setReservationPage={setReservationPage}
        />

        <DeleteEventDialog 
          deleteEventDialogOpen={deleteEventDialogOpen}
          eventToDelete={eventToDelete}
          handleDeleteEventDialogClose={handleDeleteEventDialogClose}
          handleDeleteEvent={handleDeleteEvent}
        />

        <DeleteReservationDialog 
          deleteReservationDialogOpen={deleteReservationDialogOpen}
          reservationToDelete={reservationToDelete}
          handleDeleteReservation={handleDeleteReservation}
          handleDeleteReservationDialogClose={handleDeleteReservationDialogClose}
        />

        <UpdateEventDialog 
          handleEditEvent={handleEditEvent}
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
          editDialogOpen={editDialogOpen}
          handleEditDialogClose={handleEditDialogClose}
          loading={loading}
          snackbarOpen={snackbarOpen}
          snackbarMessage={snackbarMessage}
          snackbarSeverity={snackbarSeverity}
          handleCloseSnackbar={handleCloseSnackbar}
          downloadErrorSnackbarOpen={downloadErrorSnackbarOpen}
          handleDownloadErrorSnackbarClose={handleDownloadErrorSnackbarClose}
          errors={errors}
        />
      </TableContainer>
    </Box>
  );
};

export default EventReservations;