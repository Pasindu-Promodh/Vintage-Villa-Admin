import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../config/firebaseConfig';

interface Booking {
  id: string;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface BookingActionsProps {
  booking: Booking;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({
  booking,
  onView,
  onEdit,
  onDelete
}) => {
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
          <p>Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
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

  return (
    <>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => onView(booking)}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit Booking">
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit(booking)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Booking">
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(booking)}
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
    </>
  );
};

export default BookingActions;