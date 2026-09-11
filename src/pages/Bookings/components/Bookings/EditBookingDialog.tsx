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
import StyledDateRangePicker from "../../../../components/StyledDateRangePicker";
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
    preferredContactMethod?: "email" | "whatsapp" | "both";
  };
  setEditOpen: (open: boolean) => void;
  setEditForm: (form: any) => void;
  handleSaveEdit: () => void;
  /** Booked/unavailable dates for this booking's room, to highlight in red. */
  bookedDates?: Date[];
  /** Optional note folded into the status-update email sent on save. */
  emailNote: string;
  setEmailNote: (note: string) => void;
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  editOpen,
  selectedBooking,
  editForm,
  setEditOpen,
  setEditForm,
  handleSaveEdit,
  bookedDates = [],
  emailNote,
  setEmailNote,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const contactMethod = editForm.preferredContactMethod || "whatsapp";
  const includesEmail = contactMethod === "email" || contactMethod === "both";
  const includesWhatsapp =
    contactMethod === "whatsapp" || contactMethod === "both";

  const toggleContactMethod = (method: "email" | "whatsapp") => {
    const nextEmail = method === "email" ? !includesEmail : includesEmail;
    const nextWhatsapp =
      method === "whatsapp" ? !includesWhatsapp : includesWhatsapp;

    // Never allow leaving both unchecked.
    if (!nextEmail && !nextWhatsapp) return;

    setEditForm({
      ...editForm,
      preferredContactMethod:
        nextEmail && nextWhatsapp ? "both" : nextEmail ? "email" : "whatsapp",
    });
  };

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
              <Grid item xs={12}>
                <StyledDateRangePicker
                  startLabel="Check-in"
                  endLabel="Check-out"
                  value={[
                    editForm.checkInDate
                      ? toLocalDateOnly(editForm.checkInDate)
                      : null,
                    editForm.checkOutDate
                      ? toLocalDateOnly(editForm.checkOutDate)
                      : null,
                  ]}
                  onChange={([start, end]) => {
                    setEditForm({
                      ...editForm,
                      checkInDate: start ? format(start, "yyyy-MM-dd") : "",
                      checkOutDate: end ? format(end, "yyyy-MM-dd") : "",
                    });
                  }}
                  bookedDates={bookedDates}
                />
              </Grid>

              {/* Numeric Fields */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Head Count"
                  value={editForm.headCount ?? ""}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setEditForm({
                      ...editForm,
                      headCount: Number.isNaN(n) ? 1 : Math.max(1, n),
                    });
                  }}
                  fullWidth
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Discount"
                  value={editForm.discount ?? ""}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    setEditForm({
                      ...editForm,
                      discount: Number.isNaN(n) ? 0 : Math.max(0, n),
                    });
                  }}
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
                  value={editForm.totalPrice ?? ""}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    setEditForm({
                      ...editForm,
                      totalPrice: Number.isNaN(n) ? 0 : Math.max(0, n),
                    });
                  }}
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
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Select one or both. Saving a status change notifies the
                  customer on every method selected here.
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant={includesEmail ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      onClick={() => toggleContactMethod("email")}
                    >
                      Email
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant={includesWhatsapp ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      onClick={() => toggleContactMethod("whatsapp")}
                    >
                      WhatsApp
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* Optional note for the status-update email, sent silently
                  on save when Email is one of the selected methods above. */}
              <Grid item xs={12}>
                <TextField
                  label="Note to include in status email (optional)"
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  size={isMobile ? "small" : "medium"}
                  placeholder="e.g. a reason for cancellation, or a personal welcome note"
                  disabled={!includesEmail}
                  helperText={
                    includesEmail
                      ? "Included in the automatic email if the status changes below."
                      : "Select Email above to enable."
                  }
                />
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