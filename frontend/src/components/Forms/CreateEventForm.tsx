import React from "react";
import { Alert, Box, Button, CircularProgress, DialogActions, FormControl, PopperProps, Snackbar, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider, PickersActionBarProps } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { shouldDisableEndDate, shouldDisableStartDate } from "../../utils/dateUtils";

interface CreateEventFormProps {
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  slots : number | null;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  startDateRef: React.MutableRefObject<Date | null>;
  endDateRef: React.MutableRefObject<Date | null>;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  handleStartDateAccept: (date: Date | null) => void;
  handleEndDateAccept: (date: Date | null) => void;
  loading: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  handleCloseSnackbar: () => void;
  errors: { [key: string]: string };
};

export default function CreateEventForm(props: CreateEventFormProps) {
  const {
    handleSubmit,
    handleInputChange,
    name,
    slots,
    location,
    startDate,
    endDate,
    startDateRef,
    endDateRef,
    setStartDate,
    setEndDate,
    handleStartDateAccept,
    handleEndDateAccept,
    loading,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    errors
  } = props;

  return <>
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth 
        sx={{ 
          gap: 1, 
          mt: 1,
          px: { xs: 4, sm: 8, md: 0 }
        }}>
        <TextField
          label="Name"
          name="name"
          variant="outlined"
          value={name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="No. of slots"
          name="slots"
          type="number"
          variant="outlined"
          value={slots ?? ''}
          onChange={handleInputChange}
          error={!!errors.slots}
          helperText={errors.slots}
        />
        <TextField
          label="Location"
          name="location"
          variant="outlined"
          value={location}
          onChange={handleInputChange}
          error={!!errors.location}
          helperText={errors.location}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Start Date"
            timezone="Asia/Manila"
            value={startDate}
            slots={{
              actionBar: CustomActionBar
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                error: !!errors.startDate,
                helperText: errors.startDate,
                onKeyDown: (e) => e.preventDefault()
              },
              popper: popperProps,
              layout: {
                sx: {
                  display: 'grid',
                  gridTemplateColumns: 'max-content auto max-content',
                  gridTemplateRows: 'max-content auto max-content',
                  '& .MuiDialogActions-root': {
                    gridRow: 3,
                    gridColumn: '1 / -1'
                  },
                },
              },
              actionBar: {
                actions: ['clear']
              },
              field: {
                clearable: true,
                onClear: () => {
                  setStartDate(null);
                  startDateRef.current = null;
                }
              }
            }}
            shouldDisableDate={(day) => shouldDisableStartDate(day, startDate, endDate)}
            onAccept={handleStartDateAccept}
          />
          <DateTimePicker
            label="End Date"
            timezone="Asia/Manila"
            value={endDate}
            slots={{
              actionBar: CustomActionBar
            }}
            slotProps={{
              textField: {
                variant: 'outlined',
                error: !!errors.endDate,
                helperText: errors.endDate,
                onKeyDown: (e) => e.preventDefault()
              },
              popper: popperProps,
              layout: {
                sx: {
                  display: 'grid',
                  gridTemplateColumns: 'max-content auto max-content',
                  gridTemplateRows: 'max-content auto max-content',
                  '& .MuiDialogActions-root': {
                    gridRow: 3,
                    gridColumn: '1 / -1'
                  },
                },
              },
              actionBar: {
                actions: ['clear']
              },
              field: {
                clearable: true,
                onClear: () => {
                  setEndDate(null);
                  endDateRef.current = null;
                }
              },
            }}
            shouldDisableDate={(day) => shouldDisableEndDate(day, startDate, endDate)}
            onAccept={handleEndDateAccept}
          />
        </LocalizationProvider> 
        <Box sx={{ position: 'relative' }}>
          <Button fullWidth variant="contained" type="submit" disabled={loading}>Submit</Button>
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
      </FormControl>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </form>
  </>
}

interface CustomActionBarProps extends PickersActionBarProps {}

function CustomActionBar(props: CustomActionBarProps) {
  const { onAccept, onCancel } = props;
  return (
    <DialogActions>
      <Button onClick={onCancel} color="primary">
        Cancel
      </Button>
      <Button onClick={onAccept} color="primary" variant="contained">
        OK
      </Button>
    </DialogActions>
  );
}

const popperProps: Partial<PopperProps> = {
  placement: 'right-end',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 10],
      },
    },
  ],
  style: {
    padding: 12
  },
};