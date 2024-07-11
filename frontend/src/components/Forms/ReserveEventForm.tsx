import { 
  Alert, 
  Box, 
  Button, 
  CircularProgress, 
  FormControl, 
  FormHelperText, 
  InputAdornment, 
  InputLabel, 
  Link, 
  MenuItem,
  TextField, 
  Typography 
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import SnackBar from '@mui/material/Snackbar';
import { Theme } from '@mui/material/styles';

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { EventReserve } from "../../pages/ReserveEvent";
import ReserveDatePicker from "../ReserveDatePicker";

interface ReserveEventProps {
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  events: EventReserve[];
  selectedEventDetails: EventReserve | null;
  selectedEvent: number | null;
  selectedDate: Date | null;
  dateAcceptRef: React.MutableRefObject<Date | null>;
  validateField: (name: string, value: string | number | Date | null) => string;
  submitted: boolean;

  name: string;
  email: string;
  mobile: string;
  address: string;

  setSelectedDate: (date: Date | null) => void;
  setDialogOpen: (open: boolean) => void;
  handleBlur: React.FocusEventHandler<HTMLInputElement>;
  handleSelectChange: (event: SelectChangeEvent<number>) => void;

  loading: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  handleCloseSnackbar: () => void;
  errors: { [key: string]: string };
  theme: Theme
};

export default function ReserveEventForm(props: ReserveEventProps) {

  const {
    handleSubmit,
    handleInputChange,
    events,
    selectedEventDetails,
    selectedEvent,
    selectedDate,
    dateAcceptRef,
    validateField,
    submitted,

    name,
    email,
    mobile,
    address,

    setSelectedDate,
    setDialogOpen,
    handleBlur,
    handleSelectChange,

    loading,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    errors,
    theme
  } = props;

  return <>
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ gap: 1, mt: 1 }}>
        <InputLabel id="event-select-label">{events.length > 0 ? "Event" : "No upcoming events"}</InputLabel>
        <Select
          labelId="event-select-label"
          id="event-select"
          value={selectedEvent !== null ? selectedEvent : ""}
          label="Event"
          onChange={handleSelectChange}
          error={!!errors.selectedEvent}
          disabled={events.length <= 0}
        >
          {events.map((event) => (
            <MenuItem key={event.event_id} value={event.event_id}>
              {`${event.event_name} (${event.location})`}
            </MenuItem>
          ))}
        </Select>
        {errors.selectedEvent && <FormHelperText error>{errors.selectedEvent}</FormHelperText>}
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          variant="outlined"
          value={name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
          disabled={!!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
        />
        <TextField
          fullWidth
          label="Email"
          inputMode="email"
          inputProps={{
            inputMode: "email"
          }}
          name="email"
          variant="outlined"
          value={email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.email}
          helperText={errors.email}
          disabled={!!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
        />
        <TextField
          fullWidth
          label="Mobile No."
          inputMode="numeric"
          inputProps={{
            maxLength: 12,
            inputMode: "numeric"
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{pt: 0.2}}>
                <Typography color={events.length <= 0 ? theme.palette.text.disabled : 'inherit'}>+63</Typography>
              </InputAdornment>
            ),
          }}
          name="mobile"
          variant="outlined"
          value={mobile}
          onChange={handleInputChange}
          error={!!errors.mobile}
          helperText={errors.mobile}
          disabled={!!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          variant="outlined"
          value={address}
          onClick={() => {setDialogOpen(true)}}
          onKeyUp={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key == 'Tab') {
              setDialogOpen(true);
          }
          }}
          InputProps={{
            readOnly: true,
          }}
          error={!!errors.address}
          helperText={errors.address}
          disabled={!!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
        />
        {selectedEventDetails && (
          <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <ReserveDatePicker
                startDate={selectedEventDetails.start_datetime}
                endDate={selectedEventDetails.end_datetime}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                dateAcceptRef={dateAcceptRef}
                validateField={validateField}
                submitted={submitted}
                disabled={!!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
              />
            </LocalizationProvider>
            <Typography variant="h6" color={theme.palette.primary.main} sx={{ fontSize: { xs: '1em' } }}>Number of slots left: {selectedEventDetails.slots_left}</Typography>
          </>
        )}
        <Box sx={{ position: 'relative' }}>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !!(selectedEventDetails && selectedEventDetails.slots_left <= 0 || events.length <= 0)}
            sx={{ padding: { xs: '10px 0' } }}
          >
            Submit
          </Button>
          {loading &&
            <CircularProgress size={24} sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }} />
          }
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ fontSize: '0.85em' }}>
            By submitting this form, you agree to our <Link href="/privacy-policy" target="_blank">Privacy Policy</Link>.
          </Typography>
        </Box>
      </FormControl>
      <SnackBar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </SnackBar>
    </form>
  </>
}