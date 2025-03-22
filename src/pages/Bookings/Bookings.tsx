import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, functions } from "../../config/firebaseConfig";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { httpsCallable } from "firebase/functions";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TableChartIcon from "@mui/icons-material/TableChart";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMediaQuery, useTheme } from "@mui/material";

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

const Bookings: React.FC = () => {
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [emailConfirmationPending, setEmailConfirmationPending] =
    useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [isCalendar, setisCalendar] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState<Partial<Booking>>({});

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const bookingsCollection = collection(db, "bookings");
      const bookingsQuery = query(
        bookingsCollection,
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(bookingsQuery);

      const bookingsList: Booking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(bookingsList);
      setFilteredBookings(bookingsList);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters to bookings
  useEffect(() => {
    let result = [...bookings];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter);
    }

    // Filter by search query (name, email, room)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerEmail.toLowerCase().includes(query) ||
          booking.roomTitle.toLowerCase().includes(query) ||
          booking.id.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateFilter[0] && dateFilter[1]) {
      const startDate = dateFilter[0];
      const endDate = dateFilter[1];

      result = result.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        return (
          (checkIn >= startDate && checkIn <= endDate) ||
          (checkOut >= startDate && checkOut <= endDate) ||
          (checkIn <= startDate && checkOut >= endDate)
        );
      });
    }

    setFilteredBookings(result);
  }, [bookings, statusFilter, searchQuery, dateFilter]);

  // Open booking details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      headCount: booking.headCount,
      mealOptions: { ...booking.mealOptions },
    });
    setEditOpen(true);
  };

  // Save edited booking
  const handleSaveEdit = async () => {
    if (!selectedBooking) return;

    // Check if status has changed
    // const statusChanged = editForm.status !== selectedBooking.status;

    try {
      const bookingRef = doc(db, "bookings", selectedBooking.id);
      await updateDoc(bookingRef, editForm);

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, ...editForm }
            : booking
        )
      );

      setEditOpen(false);

      // If status changed, show email confirmation dialog
      // if (statusChanged && editForm.status) {
      //   setEmailConfirmationPending(true);
      //   setConfirmEmailOpen(true);
      // }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking. Please try again.");
    }
  };

  // Handle delete booking
  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setConfirmDeleteOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedBooking) return;

    try {
      await deleteDoc(doc(db, "bookings", selectedBooking.id));

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== selectedBooking.id)
      );

      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking. Please try again.");
    }
  };

  // Send WhatsApp message
  const sendWhatsApp = (booking: Booking) => {
    const message = `
      *Regarding Your Booking*:
      Booking ID: ${booking.id}
      Room: ${booking.roomTitle}
      Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
      Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
      Status: ${booking.status.toUpperCase()}
      
      Need assistance? Feel free to reply to this message.
    `;

    const whatsappURL = `https://wa.me/${booking.customerPhone.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  };

  // Send email
  const sendEmail = async (booking: Booking) => {
    try {
      const sendCustomerEmail = httpsCallable(functions, "sendCustomerEmail");
      await sendCustomerEmail({
        bookingId: booking.id,
        subject: `Update on your booking #${booking.id}`,
        message: `
          <h2>Booking Information</h2>
          <p>Room: ${booking.roomTitle}</p>
          <p>Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}</p>
          <p>Check-out: ${new Date(
            booking.checkOutDate
          ).toLocaleDateString()}</p>
          <p>Status: ${booking.status.toUpperCase()}</p>
          <p>If you have any questions, please reply to this email.</p>
        `,
      });
      alert("Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email. Please try again.");
    }
  };

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

  const handleSendStatusChangeEmail = async () => {
    if (!selectedBooking || !emailConfirmationPending) return;

    try {
      setLoading(true);

      const sendStatusChangeEmail = httpsCallable(
        functions,
        "sendStatusChangeEmail"
      );

      await sendStatusChangeEmail({
        bookingId: selectedBooking.id,
        newStatus: editForm.status,
        customMessage: emailMessage,
      });

      setConfirmEmailOpen(false);
      setEmailConfirmationPending(false);
      setEmailMessage("");
      setLoading(false);

      // Show success message
      alert("Status update email sent successfully!");
    } catch (err) {
      console.error("Error sending status update email:", err);
      setLoading(false);
      setError("Failed to send status update email. Please try again.");
    }
  };

  const handleCancelEmail = () => {
    setConfirmEmailOpen(false);
    setEmailConfirmationPending(false);
    setEmailMessage("");
  };

  const formatCalendarData = (bookings: any[]) => {
    return bookings.map((booking) => {
      // Determine event color based on booking status
      let backgroundColor = "#3788d8"; // default blue
      switch (booking.status) {
        case "confirmed":
          backgroundColor = "#28a745"; // green
          break;
        case "pending":
          backgroundColor = "#ffc107"; // yellow
          break;
        case "cancelled":
          backgroundColor = "#dc3545"; // red
          break;
        case "completed":
          backgroundColor = "#6c757d"; // gray
          break;
      }

      return {
        id: booking.id,
        title: `${booking.roomTitle} - ${booking.customerName}`,
        start: new Date(booking.checkInDate),
        end: new Date(booking.checkOutDate),
        resource: booking,
        backgroundColor,
      };
    });
  };

  const locales = {
    "en-US": enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });
  const handleEventSelect = (event: { id: string }) => {
    // Find the booking and show details
    const booking = bookings.find((b) => b.id === event.id);
    if (booking) {
      handleViewDetails(booking);
    }
  };

  const handleNavigate = (newDate: React.SetStateAction<Date>) => {
    setCalendarDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setCalendarView(newView);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Booking Management
      </Typography>

      {/* Filter and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, Email, Room, ID"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePicker
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                slots={{
                  field: (fieldProps) => (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextField
                        {...fieldProps.startProps}
                        size="small"
                        label="Date From"
                        sx={{ width: "48%" }}
                      />
                      <Box component="span" sx={{ mx: 1 }}>
                        to
                      </Box>
                      <TextField
                        {...fieldProps.endProps}
                        size="small"
                        label="Date To"
                        sx={{ width: "48%" }}
                      />
                    </Box>
                  ),
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid
            item
            md={2}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Tooltip title="Toggle Calendar View">
              <IconButton
                color={calendarView ? "primary" : "default"}
                onClick={() => setisCalendar(!isCalendar)}
              >
                {isCalendar ? <TableChartIcon /> : <CalendarTodayIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Bookings">
              <IconButton color="primary" onClick={fetchBookings}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isCalendar ? (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 400,
                }}
              >
                <CircularProgress />
              </Box>
            ) : filteredBookings.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  No bookings found
                </Typography>
              </Box>
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Check-in</TableCell>
                    <TableCell>Check-out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.id.substring(0, 8)}...</TableCell>
                      <TableCell>{booking.roomTitle}</TableCell>
                      <TableCell>
                        <Tooltip title={booking.customerEmail}>
                          <Typography variant="body2">
                            {booking.customerName}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                      <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Booking">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Booking">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBooking(booking)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="WhatsApp">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => sendWhatsApp(booking)}
                            disabled={!booking.customerPhone}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => sendEmail(booking)}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ height: 600, p: 2 }}>
          <Calendar
            localizer={localizer}
            events={formatCalendarData(filteredBookings)}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.AGENDA, Views.MONTH, Views.WEEK, Views.DAY]}
            date={calendarDate}
            onNavigate={handleNavigate}
            view={calendarView}
            onView={handleViewChange}
            tooltipAccessor={(event) =>
              `${event.title}\nStatus: ${event.resource.status}`
            }
            onSelectEvent={handleEventSelect}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.backgroundColor,
              },
            })}
          />
        </Paper>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
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
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                color="primary"
                onClick={() => {
                  setDetailsOpen(false);
                  handleEditBooking(selectedBooking);
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
        onClose={() => setEditOpen(false)}
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
              <Button onClick={() => setEditOpen(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
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
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
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
            onClick={handleSendStatusChangeEmail}
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Send Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );


  // return (
  //   <Container 
  //     maxWidth="lg" 
  //     sx={{ 
  //       mt: 4, 
  //       mb: 4,
  //       px: isMobile ? 1 : 3 // Reduce padding on mobile
  //     }}
  //   >
  //     <Typography variant="h4" gutterBottom>
  //       Booking Management
  //     </Typography>
  
  //     {/* Filter and Search */}
  //     <Paper sx={{ p: isMobile ? 1 : 2, mb: 3 }}>
  //       <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
  //         <Grid item xs={12} sm={6} md={3}>
  //           <TextField
  //             select
  //             label="Status"
  //             value={statusFilter}
  //             onChange={(e) => setStatusFilter(e.target.value)}
  //             fullWidth
  //             size="small"
  //           >
  //             <MenuItem value="all">All</MenuItem>
  //             <MenuItem value="pending">Pending</MenuItem>
  //             <MenuItem value="confirmed">Confirmed</MenuItem>
  //             <MenuItem value="cancelled">Cancelled</MenuItem>
  //             <MenuItem value="completed">Completed</MenuItem>
  //           </TextField>
  //         </Grid>
  //         <Grid item xs={12} sm={6} md={3}>
  //           <TextField
  //             label="Search"
  //             value={searchQuery}
  //             onChange={(e) => setSearchQuery(e.target.value)}
  //             placeholder={isMobile ? "Search..." : "Name, Email, Room, ID"}
  //             fullWidth
  //             size="small"
  //           />
  //         </Grid>
  //         <Grid item xs={12} md={4}>
  //           <LocalizationProvider dateAdapter={AdapterDateFns}>
  //             <DateRangePicker
  //               value={dateFilter}
  //               onChange={(newValue) => setDateFilter(newValue)}
  //               slots={{
  //                 field: (fieldProps) => (
  //                   <Box sx={{ display: "flex", alignItems: "center" }}>
  //                     <TextField
  //                       {...fieldProps.startProps}
  //                       size="small"
  //                       label="From"
  //                       sx={{ width: "48%" }}
  //                     />
  //                     <Box component="span" sx={{ mx: 1 }}>
  //                       to
  //                     </Box>
  //                     <TextField
  //                       {...fieldProps.endProps}
  //                       size="small"
  //                       label="To"
  //                       sx={{ width: "48%" }}
  //                     />
  //                   </Box>
  //                 ),
  //               }}
  //             />
  //           </LocalizationProvider>
  //         </Grid>
  //         <Grid
  //           item
  //           xs={12}
  //           md={2}
  //           sx={{ display: "flex", justifyContent: isMobile ? "center" : "flex-end" }}
  //         >
  //           <Tooltip title="Toggle Calendar View">
  //             <IconButton
  //               color={calendarView ? "primary" : "default"}
  //               onClick={() => setisCalendar(!isCalendar)}
  //             >
  //               {isCalendar ? <TableChartIcon /> : <CalendarTodayIcon />}
  //             </IconButton>
  //           </Tooltip>
  //           <Tooltip title="Refresh Bookings">
  //             <IconButton color="primary" onClick={fetchBookings}>
  //               <RefreshIcon />
  //             </IconButton>
  //           </Tooltip>
  //         </Grid>
  //       </Grid>
  //     </Paper>
  
  //     {/* Error message */}
  //     {error && (
  //       <Alert severity="error" sx={{ mb: 2 }}>
  //         {error}
  //       </Alert>
  //     )}
  
  //     {!isCalendar ? (
  //       <Paper sx={{ width: "100%", overflow: "hidden" }}>
  //         <TableContainer sx={{ maxHeight: 600 }}>
  //           {loading ? (
  //             <Box
  //               sx={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 alignItems: "center",
  //                 height: 400,
  //               }}
  //             >
  //               <CircularProgress />
  //             </Box>
  //           ) : filteredBookings.length === 0 ? (
  //             <Box
  //               sx={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 alignItems: "center",
  //                 height: 200,
  //               }}
  //             >
  //               <Typography variant="h6" color="textSecondary">
  //                 No bookings found
  //               </Typography>
  //             </Box>
  //           ) : (
  //             <Table stickyHeader size={isMobile ? "small" : "medium"}>
  //               <TableHead>
  //                 <TableRow>
  //                   {!isMobile && <TableCell>Booking ID</TableCell>}
  //                   <TableCell>Room</TableCell>
  //                   {!isMobile && <TableCell>Customer</TableCell>}
  //                   <TableCell>Check-in</TableCell>
  //                   <TableCell>Status</TableCell>
  //                   <TableCell>Actions</TableCell>
  //                 </TableRow>
  //               </TableHead>
  //               <TableBody>
  //                 {filteredBookings.map((booking) => (
  //                   <TableRow key={booking.id} hover>
  //                     {!isMobile && <TableCell>{booking.id.substring(0, 8)}...</TableCell>}
  //                     <TableCell>{booking.roomTitle}</TableCell>
  //                     {!isMobile && (
  //                       <TableCell>
  //                         <Tooltip title={booking.customerEmail}>
  //                           <Typography variant="body2">
  //                             {booking.customerName}
  //                           </Typography>
  //                         </Tooltip>
  //                       </TableCell>
  //                     )}
  //                     <TableCell>{formatDate(booking.checkInDate)}</TableCell>
  //                     <TableCell>
  //                       <Chip
  //                         label={booking.status}
  //                         color={getStatusColor(booking.status) as any}
  //                         size="small"
  //                       />
  //                     </TableCell>
  //                     <TableCell>
  //                       <Box sx={{ display: "flex", flexWrap: "nowrap" }}>
  //                         <Tooltip title="View Details">
  //                           <IconButton
  //                             size="small"
  //                             onClick={() => handleViewDetails(booking)}
  //                           >
  //                             <VisibilityIcon fontSize="small" />
  //                           </IconButton>
  //                         </Tooltip>
  //                         <Tooltip title="Edit">
  //                           <IconButton
  //                             size="small"
  //                             color="primary"
  //                             onClick={() => handleEditBooking(booking)}
  //                           >
  //                             <EditIcon fontSize="small" />
  //                           </IconButton>
  //                         </Tooltip>
  //                         {!isMobile && (
  //                           <>
  //                             <Tooltip title="Delete">
  //                               <IconButton
  //                                 size="small"
  //                                 color="error"
  //                                 onClick={() => handleDeleteBooking(booking)}
  //                               >
  //                                 <DeleteIcon fontSize="small" />
  //                               </IconButton>
  //                             </Tooltip>
  //                             <Tooltip title="WhatsApp">
  //                               <IconButton
  //                                 size="small"
  //                                 color="success"
  //                                 onClick={() => sendWhatsApp(booking)}
  //                                 disabled={!booking.customerPhone}
  //                               >
  //                                 <WhatsAppIcon fontSize="small" />
  //                               </IconButton>
  //                             </Tooltip>
  //                             <Tooltip title="Email">
  //                               <IconButton
  //                                 size="small"
  //                                 color="info"
  //                                 onClick={() => sendEmail(booking)}
  //                               >
  //                                 <EmailIcon fontSize="small" />
  //                               </IconButton>
  //                             </Tooltip>
  //                           </>
  //                         )}
  //                       </Box>
  //                     </TableCell>
  //                   </TableRow>
  //                 ))}
  //               </TableBody>
  //             </Table>
  //           )}
  //         </TableContainer>
  //       </Paper>
  //     ) : (
  //       <Paper sx={{ height: 600, p: isMobile ? 1 : 2 }}>
  //         <Calendar
  //           localizer={localizer}
  //           events={formatCalendarData(filteredBookings)}
  //           startAccessor="start"
  //           endAccessor="end"
  //           style={{ height: "100%" }}
  //           views={isMobile ? [Views.AGENDA, Views.DAY] : [Views.AGENDA, Views.MONTH, Views.WEEK, Views.DAY]}
  //           date={calendarDate}
  //           onNavigate={handleNavigate}
  //           view={calendarView}
  //           onView={handleViewChange}
  //           tooltipAccessor={(event) =>
  //             `${event.title}\nStatus: ${event.resource.status}`
  //           }
  //           onSelectEvent={handleEventSelect}
  //           eventPropGetter={(event) => ({
  //             style: {
  //               backgroundColor: event.backgroundColor,
  //             },
  //           })}
  //         />
  //       </Paper>
  //     )}
  
  //     {/* Edit Booking Dialog */}
  //     <Dialog
  //       open={editOpen}
  //       onClose={() => setEditOpen(false)}
  //       maxWidth="sm"
  //       fullWidth
  //     >
  //       {/* Content remains the same */}
  //     </Dialog>
  
  //     {/* Confirm Delete Dialog */}
  //     <Dialog
  //       open={confirmDeleteOpen}
  //       onClose={() => setConfirmDeleteOpen(false)}
  //     >
  //       {/* Content remains the same */}
  //     </Dialog>
      
  //     {/* Email Confirmation Dialog */}
  //     <Dialog
  //       open={confirmEmailOpen}
  //       onClose={handleCancelEmail}
  //       maxWidth="sm"
  //       fullWidth
  //     >
  //       {/* Content remains the same */}
  //     </Dialog>
  //   </Container>
  // );

};

export default Bookings;

// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   deleteDoc,
//   query,
//   orderBy,
// } from "firebase/firestore";
// import { db, functions } from "../../config/firebaseConfig";
// import { View, Views } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// // Import custom components
// import BookingFilters from "./components/BookingFilters";
// import BookingTable from "./components/BookingTable";
// import BookingCalendar from "./components/BookingCalendar";
// import BookingDialogs from "./components/BookingDialogs";
// import { httpsCallable } from "firebase/functions";

// interface Booking {
//   id: string;
//   roomTitle: string;
//   checkInDate: string;
//   checkOutDate: string;
//   headCount: number;
//   customerName: string;
//   customerEmail: string;
//   customerPhone: string;
//   mealOptions: {
//     breakfast: boolean;
//     lunch: boolean;
//     dinner: boolean;
//   };
//   discount: number;
//   totalPrice: number;
//   status: "pending" | "confirmed" | "cancelled" | "completed";
//   createdAt: any;
// }

// const Bookings: React.FC = () => {
//   // State for bookings data
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // State for selected booking and dialog controls
//   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
//   const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
//   const [emailConfirmationPending, setEmailConfirmationPending] =
//     useState(false);
//   const [emailMessage, setEmailMessage] = useState("");

//   // State for filter controls
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
//     null,
//     null,
//   ]);

//   // State for view toggle and calendar
//   const [isCalendar, setIsCalendar] = useState(false);
//   const [calendarDate, setCalendarDate] = useState(new Date());
//   const [calendarView, setCalendarView] = useState<View>(Views.MONTH);

//   // Form state for editing
//   const [editForm, setEditForm] = useState<Partial<Booking>>({});

//   // Fetch bookings from Firestore
//   const fetchBookings = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const bookingsCollection = collection(db, "bookings");
//       const bookingsQuery = query(
//         bookingsCollection,
//         orderBy("createdAt", "desc")
//       );
//       const snapshot = await getDocs(bookingsQuery);

//       const bookingsList: Booking[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Booking[];

//       setBookings(bookingsList);
//       setFilteredBookings(bookingsList);
//     } catch (err) {
//       console.error("Error fetching bookings:", err);
//       setError("Failed to load bookings. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   // Apply filters when filter state changes
//   useEffect(() => {
//     let result = [...bookings];

//     // Filter by status
//     if (statusFilter !== "all") {
//       result = result.filter((booking) => booking.status === statusFilter);
//     }

//     // Filter by search query (name, email, room)
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(
//         (booking) =>
//           booking.customerName.toLowerCase().includes(query) ||
//           booking.customerEmail.toLowerCase().includes(query) ||
//           booking.roomTitle.toLowerCase().includes(query) ||
//           booking.id.toLowerCase().includes(query)
//       );
//     }

//     // Filter by date range
//     if (dateFilter[0] && dateFilter[1]) {
//       const startDate = dateFilter[0];
//       const endDate = dateFilter[1];

//       result = result.filter((booking) => {
//         const checkIn = new Date(booking.checkInDate);
//         const checkOut = new Date(booking.checkOutDate);

//         return (
//           (checkIn >= startDate && checkIn <= endDate) ||
//           (checkOut >= startDate && checkOut <= endDate) ||
//           (checkIn <= startDate && checkOut >= endDate)
//         );
//       });
//     }

//     setFilteredBookings(result);
//   }, [bookings, statusFilter, searchQuery, dateFilter]);

//   // Handlers for booking operations
//   const handleViewDetails = (booking: Booking) => {
//     setSelectedBooking(booking);
//     setDetailsOpen(true);
//   };

//   const handleEditBooking = (booking: Booking) => {
//     setSelectedBooking(booking);
//     setEditForm({
//       status: booking.status,
//       customerName: booking.customerName,
//       customerEmail: booking.customerEmail,
//       customerPhone: booking.customerPhone,
//       headCount: booking.headCount,
//       mealOptions: { ...booking.mealOptions },
//     });
//     setEditOpen(true);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedBooking) return;

//     try {
//       const bookingRef = doc(db, "bookings", selectedBooking.id);
//       await updateDoc(bookingRef, editForm);

//       // Update local state
//       setBookings((prevBookings) =>
//         prevBookings.map((booking) =>
//           booking.id === selectedBooking.id
//             ? { ...booking, ...editForm }
//             : booking
//         )
//       );

//       setEditOpen(false);

//       // Handle email confirmation if needed
//       const statusChanged = editForm.status !== selectedBooking.status;
//       if (statusChanged && editForm.status) {
//         setEmailConfirmationPending(true);
//         setConfirmEmailOpen(true);
//       }
//     } catch (err) {
//       console.error("Error updating booking:", err);
//       setError("Failed to update booking. Please try again.");
//     }
//   };

//   const handleDeleteBooking = (booking: Booking) => {
//     setSelectedBooking(booking);
//     setConfirmDeleteOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedBooking) return;

//     try {
//       await deleteDoc(doc(db, "bookings", selectedBooking.id));

//       // Update local state
//       setBookings((prevBookings) =>
//         prevBookings.filter((booking) => booking.id !== selectedBooking.id)
//       );

//       setConfirmDeleteOpen(false);
//     } catch (err) {
//       console.error("Error deleting booking:", err);
//       setError("Failed to delete booking. Please try again.");
//     }
//   };

//   // Calendar event handlers
//   const handleNavigate = (newDate: React.SetStateAction<Date>) => {
//     setCalendarDate(newDate);
//   };

//   const handleViewChange = (newView: View) => {
//     setCalendarView(newView);
//   };

//   // Filter handlers
//   const handleStatusFilterChange = (value: string) => {
//     setStatusFilter(value);
//   };

//   const handleSearchQueryChange = (value: string) => {
//     setSearchQuery(value);
//   };

//   const handleDateFilterChange = (value: [Date | null, Date | null]) => {
//     setDateFilter(value);
//   };

//   const handleToggleView = () => {
//     setIsCalendar(!isCalendar);
//   };

//   // Send WhatsApp message
//   const sendWhatsApp = (booking: Booking) => {
//     const message = `
//       *Regarding Your Booking*:
//       Booking ID: ${booking.id}
//       Room: ${booking.roomTitle}
//       Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
//       Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
//       Status: ${booking.status.toUpperCase()}

//       Need assistance? Feel free to reply to this message.
//     `;

//     const whatsappURL = `https://wa.me/${booking.customerPhone.replace(
//       /[^0-9]/g,
//       ""
//     )}?text=${encodeURIComponent(message)}`;

//     window.open(whatsappURL, "_blank");
//   };

//   // Send email
//   const sendEmail = async (booking: Booking) => {
//     try {
//       const sendCustomerEmail = httpsCallable(functions, "sendCustomerEmail");
//       await sendCustomerEmail({
//         bookingId: booking.id,
//         subject: `Update on your booking #${booking.id}`,
//         message: `
//           <h2>Booking Information</h2>
//           <p>Room: ${booking.roomTitle}</p>
//           <p>Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}</p>
//           <p>Check-out: ${new Date(
//             booking.checkOutDate
//           ).toLocaleDateString()}</p>
//           <p>Status: ${booking.status.toUpperCase()}</p>
//           <p>If you have any questions, please reply to this email.</p>
//         `,
//       });
//       alert("Email sent successfully!");
//     } catch (err) {
//       console.error("Error sending email:", err);
//       alert("Failed to send email. Please try again.");
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Booking Management
//       </Typography>

//       {/* Filters Component */}
//       <BookingFilters
//         statusFilter={statusFilter}
//         setStatusFilter={handleStatusFilterChange}
//         searchQuery={searchQuery}
//         setSearchQuery={handleSearchQueryChange}
//         dateFilter={dateFilter}
//         setDateFilter={handleDateFilterChange}
//         isCalendar={isCalendar}
//         setIsCalendar={handleToggleView}
//         refreshBookings={fetchBookings}
//       />

//       {/* Error message */}
//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* Loading state */}
//       {loading ? (
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             height: 400,
//           }}
//         >
//           <CircularProgress />
//         </Box>
//       ) : (
//         <>
//           {/* Table or Calendar View */}
//           {!isCalendar ? (
//             <BookingTable
//               loading={loading}
//               bookings={filteredBookings}
//               handleViewDetails={handleViewDetails}
//               handleEditBooking={handleEditBooking}
//               handleDeleteBooking={handleDeleteBooking}
//               sendWhatsApp={sendWhatsApp}
//               sendEmail={sendEmail}
//             />
//           ) : (
//             <BookingCalendar
//               bookings={filteredBookings}
//               loading={loading}
//               calendarDate={calendarDate}
//               calendarView={calendarView}
//               onNavigate={handleNavigate}
//               onViewChange={handleViewChange}
//               onSelectEvent={handleViewDetails}
//             />
//           )}
//         </>
//       )}

//       {/* Dialogs Component */}
//       <BookingDialogs
//         // Details dialog
//         detailsOpen={detailsOpen}
//         selectedBooking={selectedBooking}
//         setDetailsOpen={setDetailsOpen}
//         // Edit dialog
//         editOpen={editOpen}
//         setEditOpen={setEditOpen}
//         editForm={editForm}
//         onEditBooking={handleEditBooking}
//         setEditForm={setEditForm}
//         onSaveEdit={handleSaveEdit}
//         // Delete dialog
//         confirmDeleteOpen={confirmDeleteOpen}
//         setConfirmDeleteOpen={setConfirmDeleteOpen}
//         onConfirmDelete={confirmDelete}
//         // Email dialog
//         confirmEmailOpen={confirmEmailOpen}
//         emailConfirmationPending={emailConfirmationPending}
//         emailMessage={emailMessage}
//         setEmailMessage={setEmailMessage}
//         setConfirmEmailOpen={setConfirmEmailOpen}
//         setEmailConfirmationPending={setEmailConfirmationPending}
//       />
//     </Container>
//   );
// };

// export default Bookings;
