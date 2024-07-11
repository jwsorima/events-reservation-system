import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, PopperProps, Snackbar, TextField } from "@mui/material";
import { LocalizationProvider, DateTimePicker, PickersActionBarProps } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { shouldDisableEndDateUpdateEvent, shouldDisableStartDateUpdateEvent } from "../../utils/dateUtils";

interface UpdateEventDialogProps {
  handleEditEvent: (event: React.FormEvent) => Promise<void>;
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
  editDialogOpen: boolean;
  handleEditDialogClose: () => void;
  loading: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  handleCloseSnackbar: () => void;
  downloadErrorSnackbarOpen: boolean;
  handleDownloadErrorSnackbarClose: () => void;
  errors: { [key: string]: string };
};

export default function UpdateEventDialog(props: UpdateEventDialogProps) {

  const {
    handleEditEvent,
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
    editDialogOpen,
    handleEditDialogClose,
    loading,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    downloadErrorSnackbarOpen,
    handleDownloadErrorSnackbarClose,
    errors
  } = props;

  return <>
    <Dialog open={editDialogOpen} onClose={handleEditDialogClose} aria-labelledby="edit-dialog-title" maxWidth="sm" fullWidth>
      <DialogTitle id="edit-dialog-title">Edit Event</DialogTitle>
      <DialogContent>
        <form onSubmit={handleEditEvent}>
          <FormControl sx={{ gap: 1, mt: 1 }} fullWidth>
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
                    helperText: errors.startDate
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
                shouldDisableDate={(day) => shouldDisableStartDateUpdateEvent(day, startDate, endDate)}
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
                    helperText: errors.endDate
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
                shouldDisableDate={(day) => shouldDisableEndDateUpdateEvent(day, startDate, endDate)}
                onAccept={handleEndDateAccept}
              />
            </LocalizationProvider>
            <Box sx={{ position: 'relative' }}>
              <Button fullWidth variant="contained" type="submit" disabled={loading}>Save</Button>
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditDialogClose} color="primary" variant="text">
          Cancel
        </Button>
      </DialogActions>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={downloadErrorSnackbarOpen} autoHideDuration={4000} onClose={handleDownloadErrorSnackbarClose}>
        <Alert onClose={handleDownloadErrorSnackbarClose} severity="error" sx={{ width: '100%' }}>
          Failed to download the file
        </Alert>
      </Snackbar>
    </Dialog>
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