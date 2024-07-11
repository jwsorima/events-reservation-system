import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface InstructionsDialogProps {
  instructionsDialogOpen: boolean;
  setInstructionsDialogOpen: (open: boolean) => void;
};


export default function InstructionsDialog(props: InstructionsDialogProps) {

  const {
    instructionsDialogOpen,
    setInstructionsDialogOpen
  } = props;

  return <>
    <Dialog 
      open={instructionsDialogOpen} 
      onClose={() => setInstructionsDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div" fontWeight="bold">
          How to Reserve an Event <span style={{color: 'red'}}>(Notes)</span>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          1. Select an event from the dropdown menu.
        </Typography>
        <Typography variant="body1" paragraph>
          2. Fill in your personal details. (Make sure your <span style={{fontWeight: "bold"}}>email address</span> is correct and active)
        </Typography>
        <Typography variant="body1" paragraph>
          3. Click on the address field to enter your full address.
        </Typography>
        <Typography variant="body1" paragraph>
          4. Pick a date within the available range.
        </Typography>
        <Typography variant="body1" paragraph>
          5. Click the Submit button to complete your reservation.
        </Typography>
        <Typography variant="body1" paragraph>
          6. Check your email (Inbox or in Spam) for your QR Code
        </Typography>
        <Typography variant="body1" paragraph>
          7. <span style={{color: 'red'}}>Upon Event Entry: Notes...</span>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setInstructionsDialogOpen(false)} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
}