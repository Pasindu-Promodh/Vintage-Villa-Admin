import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Booking } from "../../../../components/Types"; // You'll need to create a types file

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
  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <>
        <DialogTitle>
          Booking Details{" "}
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Booking Information
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {booking.id}
              </Typography>
              <Typography variant="body2">
                <strong>Room:</strong> {booking.roomTitle}
              </Typography>
              <Typography variant="body2">
                <strong>Check-in:</strong> {formatDate(booking.checkInDate)}
              </Typography>
              <Typography variant="body2">
                <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
              </Typography>
              <Typography variant="body2">
                <strong>Head Count:</strong> {booking.headCount}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong>{" "}
                {booking.createdAt?.toDate
                  ? booking.createdAt.toDate().toLocaleString()
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Information
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {booking.customerName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {booking.customerEmail}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong>{" "}
                {booking.customerPhone || "Not provided"}
              </Typography>
              <Typography variant="body2">
                <strong>Preferred Contact:</strong>{" "}
                {booking.preferredContactMethod || "Not specified"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Meal Options
              </Typography>
              <Typography variant="body2">
                <strong>Breakfast:</strong>{" "}
                {booking.mealOptions.breakfast ? "Yes" : "No"}
              </Typography>
              <Typography variant="body2">
                <strong>Lunch:</strong>{" "}
                {booking.mealOptions.lunch ? "Yes" : "No"}
              </Typography>
              <Typography variant="body2">
                <strong>Dinner:</strong>{" "}
                {booking.mealOptions.dinner ? "Yes" : "No"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Information
              </Typography>
              <Typography variant="body2">
                <strong>Discount:</strong> ${booking.discount.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button color="primary" onClick={() => onEdit(booking)}>
            Edit
          </Button>
        </DialogActions>
      </>
    </Dialog>
  );
};

export default BookingDetailsDialog;
