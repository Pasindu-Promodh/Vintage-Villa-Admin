// React Core Imports
import React, { useState, useEffect, useMemo } from "react";

// React Big Calendar Imports
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Firebase Imports
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { db, functions } from "../../config/firebaseConfig";
import { httpsCallable } from "firebase/functions";

// Date Handling Imports
import { parse, startOfWeek, getDay, format, eachDayOfInterval } from "date-fns";
import { enGB } from "date-fns/locale";

// Material-UI (MUI) Core Imports
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
  Grid,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Local reusable components
import DashboardHeader from "../../components/DashboardHeader";
import StyledDatePicker from "../../components/StyledDatePicker";
import { toLocalDateOnly } from "../../utils/dateUtils";

// Material-UI Icon Imports
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TableChartIcon from "@mui/icons-material/TableChart";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

// Local Component Imports
import EditBookingDialog from "./components/Bookings/EditBookingDialog";
import ViewBookingDialog from "./components/Bookings/ViewBookingDialog";
import EditUnavailableDateDialog from "./components/Unavailable/EditUnavailableDialog";
import ConfirmDeleteDialog from "./components/Bookings/ConfirmDeleteDialog";
import EmailConfirmationDialog from "./components/Bookings/EmailConfirmationDialog";
import UnavailableDatesDialog from "./components/Unavailable/AddUnavailableDialog";

// Type Imports
import { Booking, Room, UnavailableDates } from "../../components/Types";
import UnavailableDateDetailsDialog from "./components/Unavailable/ViewUnavailableDialog";

const BookingManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Booking Management States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Rooms (used for the "Applies To" room selector on unavailable dates)
  const [rooms, setRooms] = useState<Room[]>([]);

  // Form Editing States
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const [editOpen, setEditOpen] = useState(false);

  // Unavailable Dates States
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDates[]>(
    []
  );
  const [filteredUnavailableDates, setFilteredUnavailableDates] = useState<
    UnavailableDates[]
  >([]);
  const [selectedUnavailableDate, setSelectedUnavailableDate] =
    useState<UnavailableDates | null>(null);
  const [editUnavailableDateForm, setEditUnavailableDateForm] = useState<
    Partial<UnavailableDates>
  >({});
  const [selectedUnavailableDateView, setSelectedUnavailableDateView] =
    useState<UnavailableDates | null>(null);
  const [unavailableDateDetailsOpen, setUnavailableDateDetailsOpen] =
    useState(false);

  // New Unavailable Date State
  const [newUnavailableDate, setNewUnavailableDate] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    reason: string;
    roomId: string;
  }>({
    startDate: null,
    endDate: null,
    reason: "",
    roomId: "all",
  });

  // Dialog and Modal States
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addUnavailableDateOpen, setAddUnavailableDateOpen] = useState(false);
  const [editUnavailableDateOpen, setEditUnavailableDateOpen] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);

  // Filter and Search States
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
    new Date(),
    null,
  ]);

  // Calendar States
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [isCalendar, setisCalendar] = useState(false);

  // Email Confirmation States
  const [emailConfirmationPending, setEmailConfirmationPending] =
    useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchUnavailableDates();
    fetchRooms();
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

    // Filter by room
    if (roomFilter !== "all") {
      const roomTitle = rooms.find((r) => r.id === roomFilter)?.title;
      result = result.filter((booking) => booking.roomTitle === roomTitle);
    }

    // Filter by date range
    if (dateFilter[0]) {
      const startDate = dateFilter[0];
      const endDate = dateFilter[1];

      result = result.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        if (!endDate) {
          return checkOut >= startDate;
        }

        return (
          (checkIn >= startDate && checkIn <= endDate) ||
          (checkOut >= startDate && checkOut <= endDate) ||
          (checkIn <= startDate && checkOut >= endDate)
        );
      });
    }

    // Sort by start date, closest first
    result.sort(
      (a, b) =>
        toLocalDateOnly(a.checkInDate).getTime() -
        toLocalDateOnly(b.checkInDate).getTime()
    );

    setFilteredBookings(result);
  }, [bookings, statusFilter, roomFilter, rooms, searchQuery, dateFilter]);

  useEffect(() => {
    let result = [...unavailableDates];

    // Filter by room
    if (roomFilter !== "all") {
      result = result.filter(
        (d) => !d.roomId || d.roomId === "all" || d.roomId === roomFilter
      );
    }

    // Filter by date range
    if (dateFilter[0]) {
      const startDate = dateFilter[0];
      const endDate = dateFilter[1];

      result = result.filter((unavailableDate) => {
        const start = new Date(unavailableDate.startDate);
        const end = new Date(unavailableDate.endDate);

        if (!endDate) {
          return end >= startDate;
        }

        return (
          (start >= startDate && start <= endDate) ||
          (end >= startDate && end <= endDate) ||
          (start <= startDate && end >= endDate)
        );
      });
    }

    // Sort by start date, closest first
    result.sort(
      (a, b) =>
        toLocalDateOnly(a.startDate).getTime() -
        toLocalDateOnly(b.startDate).getTime()
    );

    setFilteredUnavailableDates(result);
  }, [unavailableDates, roomFilter, dateFilter]);

  // Fetch Functions
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

  const fetchUnavailableDates = async () => {
    try {
      const unavailableDatesCollection = collection(db, "unavailable_dates");
      const snapshot = await getDocs(unavailableDatesCollection);

      const datesList: UnavailableDates[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UnavailableDates[];

      setUnavailableDates(datesList);
      setFilteredUnavailableDates(datesList);
    } catch (err) {
      console.error("Error fetching unavailable dates:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const roomsCollection = collection(db, "rooms");
      const snapshot = await getDocs(roomsCollection);
      const roomsList: Room[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[];
      setRooms(roomsList);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // All booked/unavailable dates across every room, used to highlight the
  // main filter calendar so admins can see availability at a glance.
  const allBookedDates = useMemo(() => {
    const dates: Date[] = [];
    bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        const start = toLocalDateOnly(b.checkInDate);
        const end = toLocalDateOnly(b.checkOutDate);
        if (start <= end) dates.push(...eachDayOfInterval({ start, end }));
      });
    unavailableDates.forEach((d) => {
      const start = toLocalDateOnly(d.startDate);
      const end = toLocalDateOnly(d.endDate);
      if (start <= end) dates.push(...eachDayOfInterval({ start, end }));
    });
    return dates;
  }, [bookings, unavailableDates]);

  // Booked/unavailable dates scoped to a single room (or every room, for
  // "all"), used inside the Edit Booking / Unavailable Date dialogs so the
  // calendar there reflects only what's relevant to the room being edited.
  const getBookedDatesForRoom = (
    roomIdOrTitle: string,
    excludeBookingId?: string
  ) => {
    const room = rooms.find(
      (r) => r.id === roomIdOrTitle || r.title === roomIdOrTitle
    );
    const roomTitle = room?.title;
    const roomId = room?.id;

    const dates: Date[] = [];

    bookings
      .filter(
        (b) =>
          b.status !== "cancelled" &&
          b.id !== excludeBookingId &&
          (roomIdOrTitle === "all" || b.roomTitle === roomTitle)
      )
      .forEach((b) => {
        const start = toLocalDateOnly(b.checkInDate);
        const end = toLocalDateOnly(b.checkOutDate);
        if (start <= end) dates.push(...eachDayOfInterval({ start, end }));
      });

    unavailableDates
      .filter(
        (d) =>
          !d.roomId ||
          d.roomId === "all" ||
          roomIdOrTitle === "all" ||
          d.roomId === roomId
      )
      .forEach((d) => {
        const start = toLocalDateOnly(d.startDate);
        const end = toLocalDateOnly(d.endDate);
        if (start <= end) dates.push(...eachDayOfInterval({ start, end }));
      });

    return dates;
  };

  // Booking View and Edit Functions
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      ...booking, // Spread the entire booking object
      checkInDate: booking.checkInDate, // Explicitly add date fields
      checkOutDate: booking.checkOutDate,
      createdAt: booking.createdAt,
      discount: booking.discount,
      totalPrice: booking.totalPrice,
    });
    setEditOpen(true);
  };

  const handleSaveBooking = async () => {
    if (!selectedBooking) return;

    // Check if status has changed
    const statusChanged = editForm.status !== selectedBooking.status;

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

      // If status changed, send notification based on preferred contact method
      if (statusChanged && editForm.status) {
        const preferredMethod = editForm.preferredContactMethod || "whatsapp";

        if (preferredMethod === "email") {
          // Show email confirmation dialog
          setEmailConfirmationPending(true);
          setConfirmEmailOpen(true);
        } else if (
          preferredMethod === "whatsapp" &&
          selectedBooking.customerPhone
        ) {
          // Send WhatsApp notification
          sendStatusWhatsApp(selectedBooking, editForm.status);
        }
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking. Please try again.");
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteBooking = async () => {
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

  // Unavailable Dates Management Functions
  const handleAddUnavailableDate = async () => {
    if (!newUnavailableDate.startDate || !newUnavailableDate.endDate) return;

    try {
      const unavailableDatesCollection = collection(db, "unavailable_dates");
      const roomTitle =
        newUnavailableDate.roomId === "all"
          ? undefined
          : rooms.find((r) => r.id === newUnavailableDate.roomId)?.title;

      const newDateEntry = {
        startDate: format(newUnavailableDate.startDate, "yyyy-MM-dd"),
        endDate: format(newUnavailableDate.endDate, "yyyy-MM-dd"),
        reason: newUnavailableDate.reason || "",
        createdAt: new Date().toISOString(),
        roomId: newUnavailableDate.roomId,
        ...(roomTitle ? { roomTitle } : {}),
      };

      const docRef = await addDoc(unavailableDatesCollection, newDateEntry);

      setUnavailableDates((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newDateEntry,
        },
      ]);

      // Reset the dialog
      setNewUnavailableDate({
        startDate: null,
        endDate: null,
        reason: "",
        roomId: "all",
      });
      setAddUnavailableDateOpen(false);
    } catch (err) {
      console.error("Error adding unavailable date:", err);
      setError("Failed to add unavailable dates. Please try again.");
    }
  };

  const handleEditUnavailableDate = (date: UnavailableDates) => {
    setSelectedUnavailableDate(date);
    setEditUnavailableDateForm({
      startDate: date.startDate,
      endDate: date.endDate,
      reason: date.reason || "",
      roomId: date.roomId || "all",
      roomTitle: date.roomTitle,
    });
    setEditUnavailableDateOpen(true);
  };

  const handleSaveUnavailableDate = async () => {
    if (!selectedUnavailableDate) return;

    try {
      const docRef = doc(db, "unavailable_dates", selectedUnavailableDate.id);
      await updateDoc(docRef, editUnavailableDateForm);

      // Update local state
      setUnavailableDates((prev) =>
        prev.map((date) =>
          date.id === selectedUnavailableDate.id
            ? { ...date, ...editUnavailableDateForm }
            : date
        )
      );

      setEditUnavailableDateOpen(false);
    } catch (err) {
      console.error("Error updating unavailable date:", err);
      setError("Failed to update unavailable date. Please try again.");
    }
  };

  const handleDeleteUnavailableDate = async (id: string) => {
    try {
      await deleteDoc(doc(db, "unavailable_dates", id));
      setUnavailableDates((prev) => prev.filter((date) => date.id !== id));
    } catch (err) {
      console.error("Error deleting unavailable date:", err);
    }
  };

  const handleUnavailableDateSelect = (event: {
    resource: UnavailableDates;
  }) => {
    if (event.resource) {
      setSelectedUnavailableDateView(event.resource);
      setUnavailableDateDetailsOpen(true);
    }
  };

  // Communication Functions
  const sendWhatsApp = (booking: Booking) => {
    const message = `
    *Regarding Your Booking*:
    Booking ID: ${booking.id}
    Room: ${booking.roomTitle}
    Check-in: ${formatDate(booking.checkInDate)}
    Check-out: ${formatDate(booking.checkOutDate)}
    Status: ${booking.status.toUpperCase()}
    
    Need assistance? Feel free to reply to this message.
  `;

    const whatsappURL = `https://wa.me/${booking.customerPhone.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  };

  const sendEmail = async (booking: Booking) => {
    try {
      const sendCustomerEmail = httpsCallable(functions, "sendCustomerEmail");
      await sendCustomerEmail({
        bookingId: booking.id,
        subject: `Update on your booking #${booking.id}`,
        message: `
        <h2>Booking Information</h2>
        <p>Room: ${booking.roomTitle}</p>
        <p>Check-in: ${formatDate(booking.checkInDate)}</p>
        <p>Check-out: ${formatDate(booking.checkOutDate)}</p>
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

  const sendStatusWhatsApp = (booking: Booking, newStatus: string) => {
    const message = `
  *Vintage Villa - Booking Status Update*
  
  Dear ${booking.customerName},
  
  Your booking #${
    booking.id
  } at Vintage Villa has been updated to: *${newStatus.toUpperCase()}*
  
  *Booking Details:*
  Room: ${booking.roomTitle}
  Check-in: ${formatDate(booking.checkInDate)}
  Check-out: ${formatDate(booking.checkOutDate)}
  Guests: ${booking.headCount}
  
  *Included Meals:*
  Breakfast: ${booking.mealOptions.breakfast ? "Yes" : "No"}
  Lunch: ${booking.mealOptions.lunch ? "Yes" : "No"} 
  Dinner: ${booking.mealOptions.dinner ? "Yes" : "No"}
  
  Total Amount: $${booking.totalPrice.toFixed(2)}
  
  If you need to make any changes to your reservation or have questions, please reply to this message or contact our front desk.
  
  Thank you for choosing Vintage Villa!
  We look forward to welcoming you.
`;

    const whatsappURL = `https://wa.me/${booking.customerPhone.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  };

  const sendStatusEmail = async () => {
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

  // Utility Functions
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

  const formatDate = (dateString: string) => {
    return format(toLocalDateOnly(dateString), "dd MMM yyyy");
  };

  const formatCalendarData = (
    bookings: Booking[],
    unavailableDates: UnavailableDates[]
  ) => {
    const bookingEvents = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.roomTitle} - ${booking.customerName}`,
      start: toLocalDateOnly(booking.checkInDate),
      end: (() => {
        const end = toLocalDateOnly(booking.checkOutDate);
        end.setDate(end.getDate() + 1);
        return end;
      })(),
      resource: booking.status,
      backgroundColor: (() => {
        switch (booking.status) {
          case "confirmed":
            return "#28a745"; // green
          case "pending":
            return "#ffc107"; // yellow
          case "cancelled":
            return "#dc3545"; // red
          case "completed":
            return "#6c757d"; // gray
          default:
            return "#3788d8"; // default blue
        }
      })(),
    }));

    const unavailableEvents = unavailableDates.map((unavailableDate) => {
      const roomLabel =
        !unavailableDate.roomId || unavailableDate.roomId === "all"
          ? "All Rooms"
          : unavailableDate.roomTitle || unavailableDate.roomId;

      return {
        id: unavailableDate.id,
        title: `Unavailable (${roomLabel}): ${
          unavailableDate.reason || "Blocked"
        }`,
        start: toLocalDateOnly(unavailableDate.startDate),
        end: (() => {
          const end = toLocalDateOnly(unavailableDate.endDate);
          end.setDate(end.getDate() + 1);
          return end;
        })(),
        backgroundColor: "#6c757d", // Grey color
        resource: unavailableDate,
      };
    });

    return [...bookingEvents, ...unavailableEvents];
  };

  // Calendar-specific Helpers
  const handleEventSelect = (event: { id: string }) => {
    // Find the booking and show details
    const booking = bookings.find((b) => b.id === event.id);
    if (booking) {
      handleViewBooking(booking);
    }
  };

  const handleNavigate = (newDate: React.SetStateAction<Date>) => {
    setCalendarDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setCalendarView(newView);
  };

  const locales = {
    "en-GB": enGB,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 0, mb: 4, width: "100%" }}>
      <DashboardHeader
        title="Booking Management"
        actions={
          <Tooltip title="Refresh Bookings">
            <IconButton color="primary" onClick={fetchBookings} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <Box sx={{ px: isMobile ? 1.5 : 2 }}>
        {/* Filter and Search */}
        <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 3 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Room"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="all">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.title}
                  </MenuItem>
                ))}
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
            <Grid item xs={6} md={2}>
              <StyledDatePicker
                label="From"
                value={dateFilter[0]}
                onChange={(date) => setDateFilter([date, dateFilter[1]])}
                bookedDates={allBookedDates}
                showTodayShortcut
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <StyledDatePicker
                label="To"
                value={dateFilter[1]}
                onChange={(date) => setDateFilter([dateFilter[0], date])}
                bookedDates={allBookedDates}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={1}
              sx={{
                display: "flex",
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}
            >
              <Tooltip title="Toggle Calendar View">
                <IconButton
                  color={calendarView ? "primary" : "default"}
                  onClick={() => setisCalendar(!isCalendar)}
                >
                  {isCalendar ? <TableChartIcon /> : <CalendarTodayIcon />}
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
        <>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
            ) : isMobile ? (
              // Mobile: card list instead of a wide table
              <Stack spacing={1.5} sx={{ p: 1.5 }}>
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} variant="outlined">
                    <CardContent sx={{ pb: "12px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {booking.roomTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {booking.customerName}
                          </Typography>
                        </Box>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {formatDate(booking.checkInDate)} →{" "}
                        {formatDate(booking.checkOutDate)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        ${booking.totalPrice.toFixed(2)} · ID{" "}
                        {booking.id.substring(0, 8)}...
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBooking(booking)}
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
                            color={
                              booking.preferredContactMethod !== "email"
                                ? "success"
                                : "default"
                            }
                            onClick={() => sendWhatsApp(booking)}
                            disabled={!booking.customerPhone}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email">
                          <IconButton
                            size="small"
                            color={
                              booking.preferredContactMethod !== "whatsapp"
                                ? "info"
                                : "default"
                            }
                            onClick={() => sendEmail(booking)}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              // Desktop: table
              <TableContainer sx={{ maxHeight: 600 }}>
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
                        <TableCell>
                          {formatDate(booking.checkOutDate)}
                        </TableCell>
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
                              onClick={() => handleViewBooking(booking)}
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
                              color={
                                booking.preferredContactMethod !== "email"
                                  ? "success"
                                  : "default"
                              }
                              onClick={() => sendWhatsApp(booking)}
                              disabled={!booking.customerPhone}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Email">
                            <IconButton
                              size="small"
                              color={
                                booking.preferredContactMethod !== "whatsapp"
                                  ? "info"
                                  : "default"
                              }
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
              </TableContainer>
            )}
          </Paper>
          <Paper sx={{ width: "100%", mt: 2, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: isMobile ? 1.5 : 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="h6">Unavailable Dates</Typography>
              <Button
                variant="contained"
                color="primary"
                size={isMobile ? "small" : "medium"}
                onClick={() => setAddUnavailableDateOpen(true)}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            {isMobile ? (
              <Stack spacing={1.5} sx={{ p: 1.5, pt: 0 }}>
                {filteredUnavailableDates.map((date) => (
                  <Card key={date.id} variant="outlined">
                    <CardContent sx={{ pb: "12px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {formatDate(date.startDate)} →{" "}
                          {formatDate(date.endDate)}
                        </Typography>
                        <Chip
                          label={
                            !date.roomId || date.roomId === "all"
                              ? "All Rooms"
                              : date.roomTitle || date.roomId
                          }
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {date.reason || "No reason specified"}
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditUnavailableDate(date)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUnavailableDate(date.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUnavailableDates.map((date) => (
                      <TableRow key={date.id} hover>
                        <TableCell>{date.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              !date.roomId || date.roomId === "all"
                                ? "All Rooms"
                                : date.roomTitle || date.roomId
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(date.startDate)}</TableCell>
                        <TableCell>{formatDate(date.endDate)}</TableCell>
                        <TableCell>{date.reason || "N/A"}</TableCell>
                        <TableCell>{formatDate(date.createdAt)}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditUnavailableDate(date)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteUnavailableDate(date.id)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      ) : (
        <Paper sx={{ height: isMobile ? 500 : 600, p: isMobile ? 1 : 2 }}>
          <Calendar
            localizer={localizer}
            events={formatCalendarData(
              filteredBookings,
              filteredUnavailableDates
            )}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.AGENDA, Views.MONTH, Views.WEEK, Views.DAY]}
            date={calendarDate}
            onNavigate={handleNavigate}
            view={calendarView}
            onView={handleViewChange}
            tooltipAccessor={(event) =>
              `${event.title}\nStatus: ${event.resource}`
            }
            onSelectEvent={(event) => {
              if (
                typeof event.resource !== "string" &&
                event.resource.startDate
              ) {
                handleUnavailableDateSelect(event);
              } else {
                handleEventSelect(event);
              }
            }}
            step={1}
            timeslots={1}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.backgroundColor,
              },
            })}
          />
        </Paper>
      )}
      </Box>

      {/* View Details Dialog */}
      <ViewBookingDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        booking={selectedBooking}
        onEdit={(booking) => {
          setDetailsOpen(false);
          handleEditBooking(booking);
        }}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
      />

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        editOpen={editOpen}
        selectedBooking={selectedBooking}
        setEditOpen={setEditOpen}
        setEditForm={setEditForm}
        editForm={editForm}
        handleSaveEdit={handleSaveBooking}
        bookedDates={getBookedDatesForRoom(
          selectedBooking?.roomTitle || "all",
          selectedBooking?.id
        )}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirmDelete={confirmDeleteBooking}
        selectedBooking={selectedBooking}
      />

      {/* Email Confirmation Dialog */}
      <EmailConfirmationDialog
        open={confirmEmailOpen}
        onClose={handleCancelEmail}
        onSendEmail={sendStatusEmail}
        loading={loading}
        selectedBooking={selectedBooking}
        editForm={editForm}
        emailMessage={emailMessage}
        setEmailMessage={setEmailMessage}
      />

      {/* Unavailable Dates Dialog */}
      <UnavailableDatesDialog
        open={addUnavailableDateOpen}
        onClose={() => setAddUnavailableDateOpen(false)}
        onSubmit={handleAddUnavailableDate}
        startDate={newUnavailableDate.startDate}
        endDate={newUnavailableDate.endDate}
        reason={newUnavailableDate.reason}
        roomId={newUnavailableDate.roomId}
        rooms={rooms}
        onStartEndDateChange={(newValue) =>
          setNewUnavailableDate((prev) => ({
            ...prev,
            startDate: newValue[0],
            endDate: newValue[1],
          }))
        }
        onReasonChange={(reason) =>
          setNewUnavailableDate((prev) => ({
            ...prev,
            reason,
          }))
        }
        onRoomChange={(roomId) =>
          setNewUnavailableDate((prev) => ({
            ...prev,
            roomId,
          }))
        }
        getBookedDatesForRoom={getBookedDatesForRoom}
      />

      {/* Edit Unavailable dates Dialog */}
      <EditUnavailableDateDialog
        open={editUnavailableDateOpen}
        selectedUnavailableDate={selectedUnavailableDate}
        rooms={rooms}
        setEditOpen={setEditUnavailableDateOpen}
        setEditForm={setEditUnavailableDateForm}
        editForm={editUnavailableDateForm}
        handleSaveEdit={handleSaveUnavailableDate}
        getBookedDatesForRoom={getBookedDatesForRoom}
      />

      {/* Unavailable Date Details Dialog */}
      <UnavailableDateDetailsDialog
        open={unavailableDateDetailsOpen}
        onClose={() => setUnavailableDateDetailsOpen(false)}
        selectedUnavailableDate={selectedUnavailableDateView}
        onEdit={(date) => {
          handleEditUnavailableDate(date);
          setUnavailableDateDetailsOpen(false);
        }}
        formatDate={formatDate}
      />
    </Container>
  );
};

export default BookingManagement;