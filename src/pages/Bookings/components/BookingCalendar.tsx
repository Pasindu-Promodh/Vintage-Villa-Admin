import React from 'react';
import { Paper, CircularProgress, Typography } from "@mui/material";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
  backgroundColor: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  loading: boolean;
  calendarDate: Date;
  calendarView: View;
  onNavigate: (newDate: Date) => void;
  onViewChange: (newView: View) => void;
  onSelectEvent: (booking: Booking) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  loading,
  calendarDate,
  calendarView,
  onNavigate,
  onViewChange,
  onSelectEvent
}) => {
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

  const formatCalendarData = (bookings: Booking[]): CalendarEvent[] => {
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

  if (loading) {
    return (
      <Paper sx={{ height: 600, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (bookings.length === 0) {
    return (
      <Paper sx={{ height: 600, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No bookings found
        </Typography>
      </Paper>
    );
  }

  const calendarEvents = formatCalendarData(bookings);

  return (
    <Paper sx={{ height: 600, p: 2 }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={[Views.AGENDA, Views.MONTH, Views.WEEK, Views.DAY]}
        date={calendarDate}
        onNavigate={onNavigate}
        view={calendarView}
        onView={onViewChange}
        tooltipAccessor={(event: CalendarEvent) =>
          `${event.title}\nStatus: ${event.resource.status}`
        }
        onSelectEvent={(event: CalendarEvent) => onSelectEvent(event.resource)}
        eventPropGetter={(event: CalendarEvent) => ({
          style: {
            backgroundColor: event.backgroundColor,
          },
        })}
      />
    </Paper>
  );
};

export default BookingCalendar;