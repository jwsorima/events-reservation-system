import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button } from "@mui/material";
import { Event } from "../../pages/admin/EventReservationsOverview";

interface DeleteEventDialogProps {
  deleteEventDialogOpen: boolean;
  eventToDelete: Event | null;
  handleDeleteEventDialogClose: () => void;
  handleDeleteEvent: () => Promise<void>;
};

export default function DeleteEventDialog(props: DeleteEventDialogProps) {

  const {
    deleteEventDialogOpen,
    eventToDelete,
    handleDeleteEventDialogClose,
    handleDeleteEvent
  } = props;

  return <>
    <Dialog open={deleteEventDialogOpen} onClose={handleDeleteEventDialogClose} aria-labelledby="delete-dialog-title" maxWidth="sm" fullWidth>
      <DialogTitle id="delete-dialog-title">Delete Event</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete the event "{eventToDelete?.event_name}" and all its reservations?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteEventDialogClose} color="primary" variant="text">
          Cancel
        </Button>
        <Button onClick={handleDeleteEvent} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </>
}