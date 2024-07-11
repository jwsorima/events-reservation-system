import React, { useEffect, useRef, useState } from "react"
import { Box, Grid, Typography, } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { toZonedTime } from 'date-fns-tz';
import { formatName, escapeHtml } from "../utils/stringUtils";

import Calendar from "../components/Calendar";
import ReserveEventForm from "../components/Forms/ReserveEventForm";
import InstructionsDialog from "../components/Dialogs/InstructionsDialog";
import AddressDetailsDialog from "../components/Dialogs/AddressDetailsDialog";
import { validateFieldReserveEvent } from "../utils/inputValidate";

export interface EventReserve {
  event_id: number;
  event_name: string;
  location: string;
  start_datetime: Date;
  end_datetime: Date;
  slots_left: number;
  color: string;
}

export default function ReserveEvent() {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const dateAcceptRef = useRef<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const [events, setEvents] = useState<EventReserve[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventReserve | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('background-color', '#1045cc');

    return () => {
      root.style.removeProperty('background-color');
    };
  }, []);

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
    const convertToUtcPlus8 = (events: EventReserve[]) => {
      return events.map((event, index) => ({
        ...event,
        start_datetime: toZonedTime(new Date(event.start_datetime), 'Asia/Manila'),
        end_datetime: toZonedTime(new Date(event.end_datetime), 'Asia/Manila'),
        color: colorList[index % colorList.length]
      }));
    };

    axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/events`)
      .then(response => {
        const convertedEvents = convertToUtcPlus8(response.data);
        setEvents(convertedEvents);
      })
      .catch(error => {
        if (error.response && error.response.status === 429) {
          setSnackbarMessage("Too many requests. Please try again after 10 minutes.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
        console.error('Error fetching events:', error);
      });
  }, [submitted]);

  useEffect(() => {
    if (selectedEvent) {
      const event = events.find(e => e.event_id === selectedEvent);
      if (event) {
        setSelectedEventDetails(event);
      }

    }
  }, [selectedEvent, events, submitted]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'name':
        if (!/^[A-Za-zÀ-ÿ ',-.]*$/.test(value)) {
          setErrors({
            ...errors,
            'name': 'Invalid character(s) provided.'
          });
        } else {
          setErrors({
            ...errors,
            'name': ''
          });
        }
        setName(formatName(value));
        return;
      case 'email':
        setErrors({ ...errors, 'email': '' });
        setEmail(value);
        return;
      case 'mobile':
        setErrors({
          ...errors,
          'mobile': ''
        });
        if (mobile.length > value.length && (value.length === 3 || value.length === 7)) {
          setMobile(value.slice(0, -1));
          return;
        }
        if(!/^9/.test(value)){
          setMobile('');
          return;
        }
        if(/[^0-9 ]/.test(value)){
          return;
        }
        if(value.length == 3 || value.length == 7) {
          setMobile(value.concat(" "))
          return
        }
        setMobile(value);
        return;
      case 'streetAddress':
        setStreetAddress(escapeHtml(value));
        break;
      case 'barangay':
        setBarangay(escapeHtml(value));
        break;
      case 'district':
        setDistrict(escapeHtml(value));
        break;
      case 'city':
        setCity(escapeHtml(value));
        break;
    }
    setErrors({
      ...errors,
      [name]: validateFieldReserveEvent(name, value)
    });
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (email && !/\.(com|edu|ph)$/.test(email.toLowerCase())) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email may have a typo error',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value;

    if (typeof value === 'number') {
      setSelectedEvent(value);
      setSelectedDate(null);
      setErrors({
        ...errors,
        selectedEvent: validateFieldReserveEvent('selectedEvent', value)
      });
    } else {
      console.error("Value is not a number");
      setSelectedEvent(null);
      setSelectedDate(null);
      setErrors({
        ...errors,
        selectedEvent: 'Invalid selection type'
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    const fullAddress = `${streetAddress}, ${barangay}, ${district}, ${city}`;
    if(streetAddress && barangay && district && city) {
      setAddress(fullAddress);
    } else {
      setAddress('');
    }
    setErrors({
      ...errors,
      address: validateFieldReserveEvent('address', fullAddress)
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const newErrors: { [key: string]: string } = {
      name: validateFieldReserveEvent('name', name),
      email: validateFieldReserveEvent('email', email),
      mobile: validateFieldReserveEvent('mobile', mobile),
      address: validateFieldReserveEvent('address', address),
      selectedEvent: validateFieldReserveEvent('selectedEvent', selectedEvent),
      selectedDate: validateFieldReserveEvent('selectedDate', selectedDate),
      streetAddress: validateFieldReserveEvent('streetAddress', streetAddress),
      barangay: validateFieldReserveEvent('barangay', barangay),
      district: validateFieldReserveEvent('district', district),
      city: validateFieldReserveEvent('city', city)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setLoading(true)
    try {
      await axios.post(`${import.meta.env.VITE_BE_DOMAIN_NAME}/reservations`, {
        event_id: selectedEvent,
        name: name,
        email: email,
        mobile_number: mobile,
        address: address,
        reservation_date: dateAcceptRef.current
      });

      setSnackbarMessage('Reservation successful! Email was sent, please check your email.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setName('');
      setEmail('');
      setMobile('');
      setStreetAddress('');
      setBarangay('');
      setDistrict('');
      setCity('');
      setAddress('');
      setSelectedEvent(null);
      setSelectedEventDetails(null);
      setSelectedDate(null);
      dateAcceptRef.current = null;
      setErrors({});
      setSubmitted(false);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseMessage = error.response?.data?.message || error.message || 'An error occurred';
        setSnackbarMessage(responseMessage);
      } else {
        setSnackbarMessage('An unknown error occurred');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return <>
    <Box className="reserveEventContainer">
      <Box sx={{
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#fafafa",
        paddingX: { xs: 2, md: 4 },
        paddingY: { xs: 2, md: 2 },
        width: { xs: "90%", sm: "75%", md: "80%" },
        borderRadius: 2,
        boxShadow: 8,
        marginTop: { xs: 0, md: 2 },
        minHeight: '600px'
      }}>
        <Grid container spacing={2} justifyContent="center" alignItems="stretch">
          <Grid item xs={12} md={4} my="auto" sx={{ marginBottom: { xs: 4, md: 0 } }}>
            <Typography variant="h5" component="div" color="black" sx={{ textAlign: 'center', fontSize: { xs: '1.5em' } }}>
              Reserve Event
            </Typography>

            <ReserveEventForm 
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              events={events}
              selectedEventDetails={selectedEventDetails}
              selectedEvent={selectedEvent}
              selectedDate={selectedDate}
              dateAcceptRef={dateAcceptRef}
              validateField={validateFieldReserveEvent}
              submitted={submitted}
              name={name}
              email={email}
              mobile={mobile}
              address={address}
              setSelectedDate={setSelectedDate}
              setDialogOpen={setDialogOpen}
              handleBlur={handleBlur}
              handleSelectChange={handleSelectChange}
              loading={loading}
              snackbarOpen={snackbarOpen}
              snackbarMessage={snackbarMessage}
              snackbarSeverity={snackbarSeverity}
              handleCloseSnackbar={handleCloseSnackbar}
              errors={errors}
              theme={theme}
            />

          </Grid>
          <Grid item xs={12} md={8} alignContent="center">

            <Calendar events={events}/>

          </Grid>
        </Grid>
      </Box>
    </Box>

    <AddressDetailsDialog 
      dialogOpen={dialogOpen}
      handleDialogClose={handleDialogClose}
      streetAddress={streetAddress}
      barangay={barangay}
      district={district}
      city={city}
      handleInputChange={handleInputChange}
      errors={errors}
    />

    <InstructionsDialog instructionsDialogOpen={instructionsDialogOpen} setInstructionsDialogOpen={setInstructionsDialogOpen}/>
  </>
}