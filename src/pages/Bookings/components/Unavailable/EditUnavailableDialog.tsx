import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Room, UnavailableDates } from "../../../../components/Types";
import StyledDatePicker from "../../../../components/StyledDatePicker";
import { toLocalDateOnly } from "../../../../utils/dateUtils";
import { format } from "date-fns";

interface EditUnavailableDateDialogProps {
  open: boolean;
  selectedUnavailableDate: UnavailableDates | null;
  rooms: Room[];
  setEditOpen: (open: boolean) => void;
  setEditForm: (form: Partial<UnavailableDates>) => void;
  editForm: Partial<UnavailableDates>;
  handleSaveEdit: () => Promise<void>;
  /** Given a room id (or "all"), returns booked/unavailable dates to highlight. */
  getBookedDatesForRoom?: (
    roomIdOrTitle: string,
    excludeBookingId?: string
  ) => Date[];
}

const EditUnavailableDateDialog: React.FC<EditUnavailableDateDialogProps> = ({
  open,
  selectedUnavailableDate,
  rooms,
  setEditOpen,
  setEditForm,
  editForm,
  handleSaveEdit,
  getBookedDatesForRoom,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!selectedUnavailableDate) return null;

  const bookedDates = getBookedDatesForRoom
    ? getBookedDatesForRoom(editForm.roomId || "all")
    : [];

  return (
    <Dialog
      open={open}
      onClose={() => setEditOpen(false)}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? "100%" : "90vh",
          borderRadius: isMobile ? 0 : undefined,
        },
      }}
    >
      <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>
        Edit Unavailable Dates
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              label="Applies To"
              value={editForm.roomId || "all"}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  roomId: e.target.value,
                  roomTitle:
                    e.target.value === "all"
                      ? undefined
                      : rooms.find((r) => r.id === e.target.value)?.title,
                })
              }
              fullWidth
              size={isMobile ? "small" : "medium"}
              helperText="Choose a specific room, or block every room at once"
            >
              <MenuItem value="all">All Rooms</MenuItem>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledDatePicker
              label="Start Date"
              value={editForm.startDate ? toLocalDateOnly(editForm.startDate) : null}
              onChange={(newValue) =>
                setEditForm({
                  ...editForm,
                  startDate: newValue ? format(newValue, "yyyy-MM-dd") : undefined,
                })
              }
              bookedDates={bookedDates}
              allowClear={false}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledDatePicker
              label="End Date"
              value={editForm.endDate ? toLocalDateOnly(editForm.endDate) : null}
              minDate={
                editForm.startDate ? toLocalDateOnly(editForm.startDate) : undefined
              }
              onChange={(newValue) =>
                setEditForm({
                  ...editForm,
                  endDate: newValue ? format(newValue, "yyyy-MM-dd") : undefined,
                })
              }
              bookedDates={bookedDates}
              allowClear={false}
            />
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
              size={isMobile ? "small" : "medium"}
              placeholder="Optional: Provide a reason (e.g., Maintenance, Private Event)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
        <Button
          onClick={() => setEditOpen(false)}
          size={isMobile ? "small" : "medium"}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveEdit}
          color="primary"
          variant="contained"
          size={isMobile ? "small" : "medium"}
          disabled={!editForm.startDate || !editForm.endDate}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUnavailableDateDialog;