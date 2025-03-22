import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField,
  Box,
  MenuItem,
  Chip,
  CircularProgress
} from '@mui/material';

interface Booking {
  id: string;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  headCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  mealOptions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  discount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: any;
}

interface BookingDialogsProps {
  // Details dialog
  detailsOpen: boolean;
  selectedBooking: Booking | null;
  setDetailsOpen: (open: boolean) => void;
  
  // Edit dialog
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  editForm: Partial<Booking>;
  onEditBooking: (booking: Booking) => void;
  setEditForm: (form: Partial<Booking>) => void;
  onSaveEdit: () => void;
  
  // Delete dialog
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
  onConfirmDelete: () => void;
  
  // Email dialog
  confirmEmailOpen: boolean;
  emailConfirmationPending: boolean;
  emailMessage: string;
  setEmailMessage: (message: string) => void;
  setConfirmEmailOpen: (open: boolean) => void;
  setEmailConfirmationPending: (pending: boolean) => void;
}

const BookingDialogs: React.FC<BookingDialogsProps> = ({
  // Details dialog
  detailsOpen,
  selectedBooking,
  setDetailsOpen,
  
  // Edit dialog
  editOpen,
  setEditOpen,
  editForm,
  onEditBooking,
  setEditForm,
  onSaveEdit,
  
  // Delete dialog
  confirmDeleteOpen,
  setConfirmDeleteOpen,
  onConfirmDelete,
  
  // Email dialog
  confirmEmailOpen,
  emailConfirmationPending,
  emailMessage,
  setEmailMessage,
  setConfirmEmailOpen,
  setEmailConfirmationPending
}) => {
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handlers
  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDeleteClose = () => {
    setConfirmDeleteOpen(false);
  };

  const handleCancelEmail = () => {
    setConfirmEmailOpen(false);
    setEmailConfirmationPending(false);
  };

  const handleSendEmail = () => {
    // Implementation would need to be added here
    // This would typically call a function passed as a prop or dispatch an action
    
    // For now, just close the dialog
    setConfirmEmailOpen(false);
    setEmailConfirmationPending(false);
  };

  return (
    <>
      {/* View Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Booking Details{" "}
              <Chip
                label={selectedBooking.status}
                color={getStatusColor(selectedBooking.status) as any}
                size="small"
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Booking Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID:</strong> {selectedBooking.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Room:</strong> {selectedBooking.roomTitle}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Check-in:</strong>{" "}
                    {formatDate(selectedBooking.checkInDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Check-out:</strong>{" "}
                    {formatDate(selectedBooking.checkOutDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Head Count:</strong> {selectedBooking.headCount}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong>{" "}
                    {selectedBooking.createdAt?.toDate
                      ? selectedBooking.createdAt.toDate().toLocaleString()
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedBooking.customerName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedBooking.customerEmail}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong>{" "}
                    {selectedBooking.customerPhone || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Meal Options
                  </Typography>
                  <Typography variant="body2">
                    <strong>Breakfast:</strong>{" "}
                    {selectedBooking.mealOptions.breakfast ? "Yes" : "No"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lunch:</strong>{" "}
                    {selectedBooking.mealOptions.lunch ? "Yes" : "No"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dinner:</strong>{" "}
                    {selectedBooking.mealOptions.dinner ? "Yes" : "No"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Discount:</strong> $
                    {selectedBooking.discount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Price:</strong> $
                    {selectedBooking.totalPrice.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsClose}>Close</Button>
              <Button
                color="primary"
                onClick={() => {
                  handleDetailsClose();
                  if (selectedBooking) {
                    onEditBooking(selectedBooking);
                  }
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Status"
                    value={editForm.status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as any,
                      })
                    }
                    fullWidth
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Name"
                    value={editForm.customerName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, customerName: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Email"
                    value={editForm.customerEmail || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customerEmail: e.target.value,
                      })
                    }
                    fullWidth
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Phone"
                    value={editForm.customerPhone || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customerPhone: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Head Count"
                    value={editForm.headCount || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        headCount: parseInt(e.target.value),
                      })
                    }
                    fullWidth
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 4 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Meal Options
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Button
                        variant={
                          editForm.mealOptions?.breakfast
                            ? "contained"
                            : "outlined"
                        }
                        color="primary"
                        fullWidth
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            mealOptions: {
                              ...editForm.mealOptions!,
                              breakfast: !editForm.mealOptions?.breakfast,
                            },
                          })
                        }
                      >
                        Breakfast
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant={
                          editForm.mealOptions?.lunch ? "contained" : "outlined"
                        }
                        color="primary"
                        fullWidth
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            mealOptions: {
                              ...editForm.mealOptions!,
                              lunch: !editForm.mealOptions?.lunch,
                            },
                          })
                        }
                      >
                        Lunch
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant={
                          editForm.mealOptions?.dinner
                            ? "contained"
                            : "outlined"
                        }
                        color="primary"
                        fullWidth
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            mealOptions: {
                              ...editForm.mealOptions!,
                              dinner: !editForm.mealOptions?.dinner,
                            },
                          })
                        }
                      >
                        Dinner
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={onSaveEdit} color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleDeleteClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this booking? This action cannot be
            undone.
          </Typography>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Booking ID:</strong> {selectedBooking.id}
              </Typography>
              <Typography variant="body2">
                <strong>Customer:</strong> {selectedBooking.customerName}
              </Typography>
              <Typography variant="body2">
                <strong>Room:</strong> {selectedBooking.roomTitle}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={onConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog
        open={confirmEmailOpen}
        onClose={handleCancelEmail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Status Update Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              The booking status has been updated to{" "}
              <strong>{editForm.status}</strong>. Would you like to send an
              email notification to the customer?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Customer: {selectedBooking?.customerName} (
              {selectedBooking?.customerEmail})
            </Typography>
            <TextField
              label="Additional Message (Optional)"
              multiline
              rows={4}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              fullWidth
              placeholder="Add any specific information you'd like to include in the email..."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEmail} color="secondary">
            Don't Send Email
          </Button>
          <Button
            onClick={handleSendEmail}
            color="primary"
            disabled={emailConfirmationPending}
          >
            {emailConfirmationPending ? <CircularProgress size={24} /> : "Send Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingDialogs;