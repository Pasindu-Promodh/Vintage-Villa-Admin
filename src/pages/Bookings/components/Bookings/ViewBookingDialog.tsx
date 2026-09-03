import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Booking } from "../../../../components/Types";

interface BookingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onEdit: (booking: Booking) => void;
  getStatusColor: (status: string) => any;
  formatDate: (dateString: string) => string;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  open,
  onClose,
  booking,
  onEdit,
  getStatusColor,
  formatDate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!booking) return null;

  const mealsList = [
    booking.mealOptions.breakfast ? "Breakfast" : null,
    booking.mealOptions.lunch ? "Lunch" : null,
    booking.mealOptions.dinner ? "Dinner" : null,
  ].filter(Boolean);

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
        Booking Details
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Box>
          <Box sx={{ mb: 1.5, display: "flex", gap: 1 }}>
            <Chip
              label={booking.roomTitle}
              size="small"
              variant="outlined"
            />
            <Chip
              label={booking.status}
              color={getStatusColor(booking.status)}
              size="small"
            />
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Booking ID:</strong> {booking.id}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Check-in:</strong> {formatDate(booking.checkInDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Head Count:</strong> {booking.headCount}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Customer:</strong> {booking.customerName}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {booking.customerEmail}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Phone:</strong> {booking.customerPhone || "Not provided"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Preferred Contact:</strong>{" "}
            {booking.preferredContactMethod || "Not specified"}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Meals:</strong>{" "}
            {mealsList.length > 0 ? mealsList.join(", ") : "None"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Discount:</strong> ${booking.discount.toFixed(2)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}
          </Typography>
          <Typography variant="body1">
            <strong>Created:</strong>{" "}
            {booking.createdAt?.toDate
              ? booking.createdAt.toDate().toLocaleString()
              : "N/A"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
        <Button
          onClick={() => onEdit(booking)}
          color="primary"
          size={isMobile ? "small" : "medium"}
        >
          Edit
        </Button>
        <Button
          onClick={onClose}
          color="secondary"
          size={isMobile ? "small" : "medium"}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;