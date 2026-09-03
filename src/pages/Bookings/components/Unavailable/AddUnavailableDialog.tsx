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
import { Room } from "../../../../components/Types";
import StyledDateRangePicker from "../../../../components/StyledDateRangePicker";

interface UnavailableDatesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
  roomId: string;
  rooms: Room[];
  onStartEndDateChange: (newValue: [Date | null, Date | null]) => void;
  onReasonChange: (reason: string) => void;
  onRoomChange: (roomId: string) => void;
  /** Given a room id (or "all"), returns booked/unavailable dates to highlight. */
  getBookedDatesForRoom?: (roomIdOrTitle: string) => Date[];
}

const UnavailableDatesDialog: React.FC<UnavailableDatesDialogProps> = ({
  open,
  onClose,
  onSubmit,
  startDate,
  endDate,
  reason,
  roomId,
  rooms,
  onStartEndDateChange,
  onReasonChange,
  onRoomChange,
  getBookedDatesForRoom,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const bookedDates = getBookedDatesForRoom
    ? getBookedDatesForRoom(roomId)
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        Add Unavailable Dates
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              label="Applies To"
              value={roomId}
              onChange={(e) => onRoomChange(e.target.value)}
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
          <Grid item xs={12}>
            <StyledDateRangePicker
              startLabel="Start Date"
              endLabel="End Date"
              value={[startDate, endDate]}
              onChange={onStartEndDateChange}
              bookedDates={bookedDates}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Reason for Unavailability"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Optional: Provide a reason (e.g., Maintenance, Private Event)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
        <Button onClick={onClose} size={isMobile ? "small" : "medium"}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          size={isMobile ? "small" : "medium"}
          disabled={!startDate || !endDate}
        >
          Add Unavailable Dates
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnavailableDatesDialog;