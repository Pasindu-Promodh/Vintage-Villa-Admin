import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  TextField
} from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { enGB } from "date-fns/locale";

interface UnavailableDatesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
  onStartEndDateChange: (newValue: [Date | null, Date | null]) => void;
  onReasonChange: (reason: string) => void;
}

const UnavailableDatesDialog: React.FC<UnavailableDatesDialogProps> = ({
  open,
  onClose,
  onSubmit,
  startDate,
  endDate,
  reason,
  onStartEndDateChange,
  onReasonChange
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add Unavailable Dates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={enGB}
            >
              <DateRangePicker
                value={[startDate, endDate]}
                onChange={onStartEndDateChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Reason for Unavailability"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              fullWidth
              placeholder="Optional: Provide a reason (e.g., Maintenance, Private Event)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          disabled={!startDate || !endDate}
        >
          Add Unavailable Dates
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnavailableDatesDialog;