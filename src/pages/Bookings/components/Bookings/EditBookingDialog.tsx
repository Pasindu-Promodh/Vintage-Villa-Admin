import React from "react";
import {
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns";
import InputAdornment from "@mui/material/InputAdornment";
import StyledDatePicker from "../../../../components/StyledDatePicker";
import { toLocalDateOnly } from "../../../../utils/dateUtils";

interface EditBookingDialogProps {
  editOpen: boolean;
  selectedBooking?: any; // Replace with your specific booking type
  editForm: {
    status?: string;
    roomTitle?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    checkInDate?: string;
    checkOutDate?: string;
    headCount?: number;
    discount?: number;
    totalPrice?: number;
    mealOptions?: {
      breakfast?: boolean;
      lunch?: boolean;
      dinner?: boolean;
    };
    preferredContactMethod?: "email" | "whatsapp";
  };
  setEditOpen: (open: boolean) => void;
  setEditForm: (form: any) => void;
  handleSaveEdit: () => void;
  /** Booked/unavailable dates for this booking's room, to highlight in red. */
  bookedDates?: Date[];
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  editOpen,
  selectedBooking,
  editForm,
  setEditOpen,
  setEditForm,
  handleSaveEdit,
  bookedDates = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          width: isMobile ? "100%" : undefined,
          maxHeight: isMobile ? "100%" : "90vh",
          borderRadius: isMobile ? 0 : undefined,
        },
      }}
    >
      {selectedBooking && (
        <>
          <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>Edit Booking</DialogTitle>
          <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
            <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mt: 0.5 }}>
              {/* Status Dropdown */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
                    })
                  }
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>

              {/* Room Title */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Room Title"
                  value={editForm.roomTitle || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, roomTitle: e.target.value })
                  }
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Customer Name"
                  value={editForm.customerName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customerName: e.target.value })
                  }
                  fullWidth
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <StyledDatePicker
                  label="Check-in Date"
                  value={
                    editForm.checkInDate
                      ? toLocalDateOnly(editForm.checkInDate)
                      : null
                  }
                  onChange={(newValue) => {
                    setEditForm({
                      ...editForm,
                      checkInDate: newValue
                        ? format(newValue, "yyyy-MM-dd")
                        : "",
                    });
                  }}
                  bookedDates={bookedDates}
                  allowClear={false}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledDatePicker
                  label="Check-out Date"
                  value={
                    editForm.checkOutDate
                      ? toLocalDateOnly(editForm.checkOutDate)
                      : null
                  }
                  minDate={
                    editForm.checkInDate
                      ? toLocalDateOnly(editForm.checkInDate)
                      : undefined
                  }
                  onChange={(newValue) => {
                    setEditForm({
                      ...editForm,
                      checkOutDate: newValue
                        ? format(newValue, "yyyy-MM-dd")
                        : "",
                    });
                  }}
                  bookedDates={bookedDates}
                  allowClear={false}
                />
              </Grid>

              {/* Numeric Fields */}
              <Grid item xs={12} sm={4}>
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
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Discount"
                  value={editForm.discount || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      discount: parseFloat(e.target.value),
                    })
                  }
                  fullWidth
                  type="number"
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Total Price"
                  value={editForm.totalPrice || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalPrice: parseFloat(e.target.value),
                    })
                  }
                  fullWidth
                  type="number"
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>

              {/* Meal Options */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Meal Options
                </Typography>
                <Grid container spacing={1}>
                  {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                    const mealKey = meal.toLowerCase() as
                      | "breakfast"
                      | "lunch"
                      | "dinner";
                    return (
                      <Grid item xs={4} key={meal}>
                        <Button
                          variant={
                            editForm.mealOptions?.[mealKey]
                              ? "contained"
                              : "outlined"
                          }
                          color="primary"
                          fullWidth
                          size={isMobile ? "small" : "medium"}
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              mealOptions: {
                                ...editForm.mealOptions!,
                                [mealKey]: !editForm.mealOptions?.[mealKey],
                              },
                            })
                          }
                        >
                          {meal}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              {/* Preferred Contact Method */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Preferred Contact Method
                </Typography>
                <Grid container spacing={1}>
                  {["Email", "WhatsApp"].map((method) => {
                    const methodKey = method.toLowerCase() as
                      | "email"
                      | "whatsapp";
                    return (
                      <Grid item xs={6} key={method}>
                        <Button
                          variant={
                            editForm.preferredContactMethod === methodKey
                              ? "contained"
                              : "outlined"
                          }
                          color="primary"
                          fullWidth
                          size={isMobile ? "small" : "medium"}
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              preferredContactMethod: methodKey,
                            })
                          }
                        >
                          {method}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
            <Button
              onClick={() => setEditOpen(false)}
              color="secondary"
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              color="primary"
              variant="contained"
              size={isMobile ? "small" : "medium"}
            >
              Save Changes
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default EditBookingDialog;