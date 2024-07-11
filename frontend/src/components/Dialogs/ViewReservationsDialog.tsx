import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TableContainer, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Typography, 
  Button, 
  TableFooter, 
  Pagination, 
  DialogActions 
} from "@mui/material";
import React from "react";
import { AddressTooltip, StyledTablePagination } from "../styledComponents";
import { Reservation } from "../../pages/admin/EventReservationsOverview";

interface ViewReservationsDialogProps {
  open: boolean;
  handleCloseReservations: () => void;
  selectedEventName: string | undefined;
  currentReservations: Reservation[];
  handleDeleteReservationDialogOpen: (reservation: Reservation) => void;
  reservationTotal: number;
  reservationRowsPerPage: number;
  reservationPage: number;
  handleReservationChangePage: (_: unknown, newPage: number) => void;
  handleReservationChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setReservationPage: (value: React.SetStateAction<number>) => void;
};

export default function ViewReservationsDialog(props: ViewReservationsDialogProps) {

  const {
    open,
    handleCloseReservations,
    selectedEventName,
    currentReservations,
    handleDeleteReservationDialogOpen,
    reservationTotal,
    reservationRowsPerPage,
    reservationPage,
    handleReservationChangePage,
    handleReservationChangeRowsPerPage,
    setReservationPage
  } = props;

  return <>
    <Dialog open={open} onClose={handleCloseReservations} aria-labelledby="form-dialog-title" maxWidth="lg" fullWidth>
      <DialogTitle id="form-dialog-title">Reservations for {selectedEventName}</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reservation Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Address</TableCell>
                <TableCell>Selected Date</TableCell>
                <TableCell>Attended</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentReservations.map((reservation) => (
                <TableRow key={reservation.reservation_id}>
                  <TableCell>{reservation.reservation_number}</TableCell>
                  <TableCell>{reservation.name}</TableCell>
                  <TableCell>{reservation.email}</TableCell>
                  <TableCell>{reservation.mobile_number}</TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <AddressTooltip
                      title={
                        <React.Fragment>
                          <Typography variant="body2" color="textSecondary" component="div">
                            {reservation.address}
                          </Typography>
                        </React.Fragment>
                      }
                      enterTouchDelay={0}
                      leaveTouchDelay={500}
                    >
                      <span style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {reservation.address}
                      </span>
                    </AddressTooltip>
                  </TableCell>
                  <TableCell>{new Date(reservation.reservation_date).toLocaleString('en-US', {
                    timeZone: 'Asia/Manila',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{reservation.scanned ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteReservationDialogOpen(reservation)}
                      sx={{ textTransform: 'none' }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <StyledTablePagination
                  align="left"
                  colSpan={4}
                  rowsPerPageOptions={[5, 10, 25]}
                  count={reservationTotal}
                  rowsPerPage={reservationRowsPerPage}
                  page={reservationPage}
                  onPageChange={handleReservationChangePage}
                  onRowsPerPageChange={handleReservationChangeRowsPerPage}
                  sx={{ display: 'table-cell', justifyContent: 'flex-start', alignItems: 'center', flex: 1, padding: 2, borderBottom: 'none' }}
                />
                <TableCell colSpan={4} align="right" sx={{ borderBottom: 'none', padding: 2 }}>
                  <Pagination
                    count={Math.ceil(reservationTotal / reservationRowsPerPage)}
                    page={reservationPage + 1}
                    onChange={(_event, page) => setReservationPage(page - 1)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1, borderBottom: 'none' }}
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseReservations} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
}