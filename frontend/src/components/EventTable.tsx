import { Table, TableHead, TableRow, TableCell, TableBody, Grid, Button, TableFooter, Pagination } from "@mui/material";
import { StyledTablePagination } from "./styledComponents";
import { Event } from "../pages/admin/EventReservationsOverview";

interface EventTableProps {
  currentEvents: Event[];
  handleClickOpenReservations: (event: Event) => void;
  handleEditEventDialogOpen: (event: Event) => void;
  handleDeleteEventDialogOpen: (event: Event) => void;
  handleDownload: (event_id: number) => Promise<void>;
  eventTotal: number;
  eventRowsPerPage: number;
  eventPage: number;
  handleEventChangePage: (_: unknown, newPage: number) => void;
  handleEventChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setEventPage: (value: React.SetStateAction<number>) => void;
};

export default function EventTable(props: EventTableProps) {

  const {
    currentEvents,
    handleClickOpenReservations,
    handleEditEventDialogOpen,
    handleDeleteEventDialogOpen,
    handleDownload,
    eventTotal,
    eventRowsPerPage,
    eventPage,
    handleEventChangePage,
    handleEventChangeRowsPerPage,
    setEventPage
  } = props;

  return <>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event Name</TableCell>
          <TableCell>Slots</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Start Date and Time</TableCell>
          <TableCell>End Date and Time</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {currentEvents.map((event) => (
          <TableRow key={event.event_id}>
            <TableCell>{event.event_name}</TableCell>
            <TableCell>{event.slots}</TableCell>
            <TableCell>{event.location}</TableCell>
            <TableCell>{new Date(event.start_datetime).toLocaleString('en-US', {timeZone: 'Asia/Manila'})}</TableCell>
            <TableCell>{new Date(event.end_datetime).toLocaleString('en-US', {timeZone: 'Asia/Manila'})}</TableCell>
            <TableCell align="center">
              <Grid container spacing={1} justifyContent="center">
                <Grid item xs={12} sm="auto">
                  <Button 
                    variant="contained" 
                    onClick={() => handleClickOpenReservations(event)}  
                    sx={{ textTransform: 'none' }}
                  >
                    List of Reservations
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleEditEventDialogOpen(event)}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteEventDialogOpen(event)}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleDownload(event.event_id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Download
                  </Button>
                </Grid>
              </Grid>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <StyledTablePagination
            align="left"
            colSpan={3}
            aria-colspan={3}
            rowsPerPageOptions={[5, 10, 25]}
            count={eventTotal}
            rowsPerPage={eventRowsPerPage}
            page={eventPage}
            onPageChange={handleEventChangePage}
            onRowsPerPageChange={handleEventChangeRowsPerPage}
            sx={{ display: 'table-cell', justifyContent: 'flex-start', alignItems: 'center', flex: 1, paddingY: 2, borderBottom: 'none', color: 'black !important', zIndex: 9999 }}
          />
          <TableCell colSpan={3} align="right" sx={{ borderBottom: 'none', padding: 2 }}>
            <Pagination
              count={Math.ceil(eventTotal / eventRowsPerPage)}
              page={eventPage + 1}
              onChange={(_event, page) => setEventPage(page - 1)}
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
  </>
}