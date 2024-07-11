import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

interface AddressDetailsDialogProps {
  dialogOpen: boolean;
  handleDialogClose: () => void;
  streetAddress: string;
  barangay: string;
  district: string;
  city: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { [key: string]: string };
};

export default function AddressDetailsDialog(props: AddressDetailsDialogProps) {

  const {
    dialogOpen,
    handleDialogClose,
    streetAddress,
    barangay,
    district,
    city,
    handleInputChange,
    errors,
  } = props;

  return <>
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>Enter Address Details <span style={{color: 'red', fontSize: 'inherit'}}>(Notes)</span></DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Street Address"
          inputProps={{
            maxLength: 100
          }}
          name="streetAddress"
          type="text"
          variant="outlined"
          value={streetAddress}
          onChange={handleInputChange}
          error={!!errors.streetAddress}
          helperText={errors.streetAddress}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Barangay"
          inputProps={{
            maxLength: 70
          }}
          name="barangay"
          type="text"
          variant="outlined"
          value={barangay}
          onChange={handleInputChange}
          error={!!errors.barangay}
          helperText={errors.barangay}
        />
        <TextField
          fullWidth
          margin="dense"
          label="District"
          inputProps={{
            maxLength: 35
          }}
          name="district"
          type="text"
          variant="outlined"
          value={district}
          onChange={handleInputChange}
          error={!!errors.district}
          helperText={errors.district}
        />
        <TextField
          fullWidth
          margin="dense"
          label="City"
          inputProps={{
            maxLength: 35
          }}
          name="city"
          type="text"
          variant="outlined"
          value={city}
          onChange={handleInputChange}
          error={!!errors.city}
          helperText={errors.city}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} variant="contained" color="primary" disabled={!streetAddress || !barangay || !district || !city}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  </>
}