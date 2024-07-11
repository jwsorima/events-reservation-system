import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { useTheme, useMediaQuery, Container, Typography, CircularProgress, Box, Button, Card, CardContent, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import { isUuidV4 } from '../../utils/stringUtils';

interface Event {
  event_name: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
}

interface Reservation {
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

const ReservationDetailsAdmin: React.FC = () => {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previousURL = useRef('');
  const [data, setData] = useState<ReservationDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        const codeReader = new BrowserMultiFormatReader(hints);

        const devices = await codeReader.listVideoInputDevices();
        if (devices.length === 0) {
          console.error('No video input devices found.');
          return;
        }
        setVideoInputDevices(devices);
        setSelectedDeviceId(devices[0].deviceId);
        codeReader.decodeFromVideoDevice(devices[0].deviceId, videoRef.current, () => {});
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Error accessing camera. Please ensure your browser has camera permissions enabled.');
      }
    };

    requestCameraAccess();

    return () => {
      const codeReader = new BrowserMultiFormatReader();
      codeReader.reset();
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const fetchData = async (eventID: string | null, reservationID: string | null) => {
      setError(null);
      setLoading(true);
      await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/reservations/details?event_id=${eventID}&reservation_id=${reservationID}`, { withCredentials: true })
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          if (error.response && error.response.status === 429) {
            setError('Too many requests. Please try again after 10 minutes.');
          } else {
            setError('Reservation not found');
          }
        })
        .finally(() => {
          setScanned(true);
          setLoading(false);
        });
    };
    const codeReader = new BrowserMultiFormatReader();

    const startDecoding = (deviceId: string) => {
      codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (qrResult) => {
        if (qrResult) {
          const url = qrResult.getText();
          const urlParams = new URLSearchParams(url.split('?')[1]);

          const eventID = urlParams.get('event_id');
          const reservationID = urlParams.get('reservation_id');

          if(reservationID === '' || reservationID === null || !isUuidV4(reservationID)) {
            setData(null);
            setScanned(true)
            setError('Reservation not found');
            setLoading(false)
            return;
          }

          if (eventID && reservationID) {
            const currentURL = `${eventID}_${reservationID}`;
            if (previousURL.current !== currentURL) {
              previousURL.current = currentURL;

              fetchData(eventID, reservationID);
            }
          }
        }
      });
    };

    startDecoding(selectedDeviceId);

    return () => {
      codeReader.reset();
    };
  }, [selectedDeviceId]);

  const handleDeviceChange = (event: SelectChangeEvent<string>) => {
    setSelectedDeviceId(event.target.value as string);
  };

  const handleClear = () => {
    setData(null);
    setScanned(false);
    setError(null);
    previousURL.current = '';
  };

  let message, icon, color;
  if (data?.message === 'Reservation has already been scanned') {
    message = 'Reservation has already been scanned.';
    icon = <InfoIcon fontSize="large" sx={{ color: theme.palette.primary.main, mr: 1 }} />;
    color = theme.palette.primary.main;
  } else if (data?.message === 'Reservation has been scanned') {
    message = 'Reservation has been scanned.';
    icon = <CheckCircleIcon fontSize="large" sx={{ color: theme.palette.success.main, mr: 1 }} />;
    color = theme.palette.success.main;
  }

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <FormControl variant="outlined" style={{ width: isSmallScreen ? '300px' : '400px' }}>
          <InputLabel id="camera-select-label">Select Camera</InputLabel>
          <Select
            labelId="camera-select-label"
            value={selectedDeviceId || ''}
            onChange={handleDeviceChange}
            label="Select Camera"
          >
            {videoInputDevices.map((device, index) => (
              <MenuItem key={index} value={device.deviceId}>
                {device.label || `Device ${index + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" position="relative">
          <video ref={videoRef} style={{ width: isSmallScreen ? '300px' : '400px', height: isSmallScreen ? '300px' : '400px' }} />
          <div className="qr-scanner-overlay">
            <div className="qr-scanner-frame">
              <div className="qr-scanner-corner top-left"></div>
              <div className="qr-scanner-corner top-right"></div>
              <div className="qr-scanner-corner bottom-left"></div>
              <div className="qr-scanner-corner bottom-right"></div>
            </div>
          </div>
        </Box>
        <Button variant="contained" color="primary" onClick={handleClear} sx={{ my: 2 }}>
          Clear
        </Button>
      </Box>

      {scanned && (
        loading ? (
          <Card sx={{ boxShadow: 8, padding: theme.spacing(2), minHeight: '300px', maxWidth: '600px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ marginTop: 2, color: theme.palette.primary.main }}>
                Loading...
              </Typography>
            </CardContent>
          </Card>
        ) : (
          !error ? (
            <>
              <Card sx={{ boxShadow: 8, maxWidth: '600px', margin: '20px auto' }}>
                <CardContent sx={{ borderTop: `2px solid ${color}`, borderRadius: '4px', paddingX: 4, paddingTop: 4, paddingBottom: '40px !important' }}>
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
              <Card sx={{ boxShadow: 8, padding: theme.spacing(2), minHeight: '100px', maxWidth: '600px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color }}>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      {icon}
                      {message}
                    </Box>
                  </Typography>
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
            </>
          ) : (
            <Card sx={{ boxShadow: 8, padding: theme.spacing(2), borderTop: '2px solid #d32f2f', borderRadius: '4px', minHeight: '300px', maxWidth: '600px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                  {error}
                </Typography>
              </CardContent>
            </Card>
          )
        )
      )}
    </Container>
  );
};

export default ReservationDetailsAdmin;