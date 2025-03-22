import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

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

interface BookingTableProps {
  loading: boolean;
  bookings: Booking[];
  handleViewDetails: (booking: Booking) => void;
  handleEditBooking: (booking: Booking) => void;
  handleDeleteBooking: (booking: Booking) => void;
  sendWhatsApp: (booking: Booking) => void;
  sendEmail: (booking: Booking) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  loading,
  bookings,
  handleViewDetails,
  handleEditBooking,
  handleDeleteBooking,
  sendWhatsApp,
  sendEmail,
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

  if (loading) {
    return (
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
    );
  }

  if (bookings.length === 0) {
    return (
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
    );
  }

  return (
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
          {bookings.map((booking) => (
            <TableRow key={booking.id} hover>
              <TableCell>{booking.id.substring(0, 8)}...</TableCell>
              <TableCell>{booking.roomTitle}</TableCell>
              <TableCell>
                <Tooltip title={booking.customerEmail}>
                  <Typography variant="body2">{booking.customerName}</Typography>
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
    </TableContainer>
  );
};

export default BookingTable;