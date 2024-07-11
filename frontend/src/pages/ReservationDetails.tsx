import React, { useEffect, useState, useMemo } from 'react';
import { useTheme, Container, Typography, CircularProgress, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { isUuidV4 } from '../utils/stringUtils';

interface Event {
  event_id: number;
  event_name: string;
  slots: number;
  location: string;
  start_datetime: string;
  end_datetime: string;
}

interface Reservation {
  reservation_id: number;
  event_id: number;
  name: string;
  email: string;
  mobile_number: string;
  reservation_date: string;
  reservation_number: number;
  address: string;
}

interface ReservationDetailsProps {
  event?: Event;
  reservation?: Reservation;
  message?: string;
}

const ReservationDetails: React.FC = () => {
  const theme = useTheme();
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const event_id = query.get('event_id');
  const reservation_id = query.get('reservation_id');
  const hasEventId = query.has('event_id');
  const hasReservationId = query.has('reservation_id');

  const [data, setData] = useState<ReservationDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservation_id === '' || reservation_id === null || !isUuidV4(reservation_id)) {
      setError('Reservation not found.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/reservations/details?event_id=${event_id}&reservation_id=${reservation_id}`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        if (error.response && error.response.status === 429) {
          setError('Too many requests. Please try again after 10 minutes.');
        } else {
          setError('Reservation not found.');
        }
      })
      .finally(() => {
        setLoading(false);
      })
    };
    setTimeout(() => {
      fetchData();
    }, 500)
  }, [event_id, reservation_id, hasEventId, hasReservationId]);

  useEffect(() => {
    document.body.classList.add('reservationDetailsBackground');

    return () => {
      document.body.classList.remove('reservationDetailsBackground');
    };
  }, []);

  if (loading) {
    return (
      <Container>
        <Card sx={{ boxShadow: 8, padding: theme.spacing(2), minHeight: '300px', maxWidth: '600px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ marginTop: 2, color: theme.palette.primary.main }}>
              Loading...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card sx={{ boxShadow: 8, padding: theme.spacing(2), minHeight: '300px', maxWidth: '600px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  return (
    <Container>
      <Card sx={{ boxShadow: 8, padding: theme.spacing(2), maxWidth: '600px', margin: '20px auto' }}>
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: theme.palette.primary.main, marginBottom: theme.spacing(2) }}
          >
            Reservation Details
          </Typography>
          <Box mb={2}>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Name:</strong> {data?.reservation?.name || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Email:</strong> {data?.reservation?.email || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Mobile:</strong> {data?.reservation?.mobile_number || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Selected Date:</strong> {data?.reservation?.reservation_date ? new Date(data.reservation.reservation_date).toLocaleDateString('en-US', { timeZone: 'UTC'}) : 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Reservation Number:</strong> {data?.reservation?.reservation_number || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Address:</strong> {data?.reservation?.address || 'N/A'}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 8, padding: theme.spacing(2), maxWidth: '600px', margin: '20px auto' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
            Event Details
          </Typography>
          <Box mb={2}>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Name:</strong> {data?.event?.event_name || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Location:</strong> {data?.event?.location || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>Start:</strong> {data?.event?.start_datetime ? formatDateTime(data.event.start_datetime) : 'N/A'}</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.primary.main }}><strong>End:</strong> {data?.event?.end_datetime ? formatDateTime(data.event.end_datetime) : 'N/A'}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReservationDetails;
