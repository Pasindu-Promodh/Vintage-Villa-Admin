import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TableChartIcon from "@mui/icons-material/TableChart";

interface BookingFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: [Date | null, Date | null];
  setDateFilter: (dates: [Date | null, Date | null]) => void;
  isCalendar: boolean;
  setIsCalendar: (isCalendar: boolean) => void;
  refreshBookings: () => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  isCalendar,
  setIsCalendar,
  refreshBookings,
}) => {
  return (
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
      <Grid item md={2} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Toggle Calendar View">
          <IconButton
            color={isCalendar ? "primary" : "default"}
            onClick={() => setIsCalendar(!isCalendar)}
          >
            {isCalendar ? <TableChartIcon /> : <CalendarTodayIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh Bookings">
          <IconButton color="primary" onClick={refreshBookings}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export default BookingFilters;