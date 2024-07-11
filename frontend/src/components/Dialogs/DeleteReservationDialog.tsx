import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button } from "@mui/material";
import { Reservation } from "../../pages/admin/EventReservationsOverview";

interface DeleteReservationDialogProps {
  deleteReservationDialogOpen: boolean;
  reservationToDelete: Reservation | null;
  handleDeleteReservationDialogClose: () => void;
  handleDeleteReservation: () => Promise<void>;
};

export default function DeleteReservationDialog(props: DeleteReservationDialogProps) {

  const {
    deleteReservationDialogOpen,
    reservationToDelete,
    handleDeleteReservationDialogClose,
    handleDeleteReservation
  } = props;

  return <>
    <Dialog open={deleteReservationDialogOpen} onClose={handleDeleteReservationDialogClose} aria-labelledby="delete-reservation-dialog-title" maxWidth="sm" fullWidth>
      <DialogTitle id="delete-reservation-dialog-title">Delete Reservation</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete the reservation for "{reservationToDelete?.name}"?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteReservationDialogClose} color="primary" variant="text">
          Cancel
        </Button>
        <Button onClick={handleDeleteReservation} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </>
}