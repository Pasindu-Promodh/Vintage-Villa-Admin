import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { enGB } from "date-fns/locale";
import { UnavailableDates } from "../../../../components/Types";

interface EditUnavailableDateDialogProps {
  open: boolean;
  selectedUnavailableDate: UnavailableDates | null;
  setEditOpen: (open: boolean) => void;
  setEditForm: (form: Partial<UnavailableDates>) => void;
  editForm: Partial<UnavailableDates>;
  handleSaveEdit: () => Promise<void>;
}

const EditUnavailableDateDialog: React.FC<EditUnavailableDateDialogProps> = ({
  open,
  selectedUnavailableDate,
  setEditOpen,
  setEditForm,
  editForm,
  handleSaveEdit,
}) => {
  if (!selectedUnavailableDate) return null;

  return (
    <Dialog
      open={open}
      onClose={() => setEditOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Unavailable Dates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={enGB}
            >
              <DateRangePicker
                value={[
                  editForm.startDate ? new Date(editForm.startDate) : null,
                  editForm.endDate ? new Date(editForm.endDate) : null,
                ]}
                onChange={(newValue) => {
                  setEditForm({
                    ...editForm,
                    startDate: newValue[0]?.toISOString(),
                    endDate: newValue[1]?.toISOString(),
                  });
                }}
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
              value={editForm.reason || ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  reason: e.target.value,
                })
              }
              fullWidth
              placeholder="Optional: Provide a reason (e.g., Maintenance, Private Event)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button
          onClick={handleSaveEdit}
          color="primary"
          disabled={!editForm.startDate || !editForm.endDate}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUnavailableDateDialog;
